import { getZones } from "./domains.js";

export default {
  async scheduled(event, env, ctx) {
    await updateStats(env);
  },
  
  async fetch(request, env) {
    if (request.method === "POST") {
      try {
        const result = await updateStats(env);
        return new Response(JSON.stringify(result), { 
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: "Internal server error" }), { 
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
    }
    return new Response("POST to trigger update", { status: 200 });
  }
};

async function updateStats(env) {
  // Zone IDs from shared config (used for Zone Analytics httpRequests1dGroups)
  // Note: Using uniq.uniques for unique visitor counts (filters out bots)
  const zones = getZones();

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);
  
  const formatDate = (d) => d.toISOString().split("T")[0];
  
  const data = [];
  for (let i = 1; i <= 30; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    data.push({
      date: formatDate(date),
      domains: {}
    });
  }

  const errors = [];
  const browsers = {};
  
  // Calculate date range for last 7 complete days (exclude today)
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const eightDaysAgo = new Date(today);
  eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);

  for (const [domain, zoneId] of Object.entries(zones)) {
    try {
      // Use Zone Analytics - httpRequests1dGroups for daily unique visitors
      // Also fetch browser stats for last 7 days
      const query = `
        query {
          viewer {
            zones(filter: {zoneTag: "${zoneId}"}) {
              httpRequests1dGroups(
                limit: 30
                filter: {
                  date_gt: "${formatDate(startDate)}"
                }
                orderBy: [date_ASC]
              ) {
                dimensions {
                  date
                }
                uniq {
                  uniques
                }
                sum {
                  browserMap {
                    pageViews
                    uaBrowserFamily
                  }
                }
              }
            }
          }
        }
      `;

      const response = await fetch("https://api.cloudflare.com/client/v4/graphql", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.CF_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query })
      });

      const result = await response.json();
      
      if (result.errors) {
        errors.push({ domain, errors: result.errors });
        continue;
      }
      
      if (result.data?.viewer?.zones?.[0]?.httpRequests1dGroups) {
        result.data.viewer.zones[0].httpRequests1dGroups.forEach(day => {
          const dayData = data.find(d => d.date === day.dimensions.date);
          if (dayData) {
            // Use uniques count from Zone Analytics (filters out bots)
            dayData.domains[domain] = day.uniq.uniques;
          }
          
          // Aggregate browser stats from last 7 complete days (exclude today)
          const dayDate = day.dimensions.date;
          if (dayDate > formatDate(eightDaysAgo) && dayDate <= formatDate(yesterday) && day.sum?.browserMap) {
            day.sum.browserMap.forEach(browser => {
              const family = browser.uaBrowserFamily || "Unknown";
              browsers[family] = (browsers[family] || 0) + browser.pageViews;
            });
          }
        });
      }
    } catch (e) {
      errors.push({ domain, error: e.message });
    }
  }

  // Calculate daily average from 7-day totals and sort by pageViews descending
  const dailyBrowsers = Object.fromEntries(
    Object.entries(browsers)
      .map(([name, total]) => [name, Math.round(total / 7)])
      .sort((a, b) => b[1] - a[1])
  );

  // Build final stats object with browsers (daily averages)
  const statsOutput = {
    date: formatDate(endDate),
    domains: data,
    browsers: dailyBrowsers
  };

  // Commit to GitHub - stats branch
  const content = btoa(JSON.stringify(statsOutput, null, 2));
  
  let sha = null;
  try {
    const getFile = await fetch(
      "https://api.github.com/repos/essentials-com/essentials.com/contents/stats.json?ref=stats",
      {
        headers: {
          "Authorization": `Bearer ${env.GITHUB_TOKEN}`,
          "User-Agent": "essentials-stats-worker",
          "Accept": "application/vnd.github.v3+json"
        }
      }
    );
    if (getFile.ok) {
      const fileData = await getFile.json();
      sha = fileData.sha;
    }
  } catch (e) {}

  const commitBody = {
    message: `Update stats ${formatDate(endDate)}`,
    content: content,
    branch: "stats"
  };
  if (sha) commitBody.sha = sha;

  const commitResponse = await fetch(
    "https://api.github.com/repos/essentials-com/essentials.com/contents/stats.json",
    {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${env.GITHUB_TOKEN}`,
        "User-Agent": "essentials-stats-worker",
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(commitBody)
    }
  );

  if (!commitResponse.ok) {
    const error = await commitResponse.text();
    throw new Error(`GitHub commit failed: ${error}`);
  }

  return { success: true, date: formatDate(endDate), errors, dataPoints: data.length };
}
