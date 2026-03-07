# Agent Instructions

This directory contains project-specific agent context. The [aidevops](https://aidevops.sh)
framework is loaded separately via the global config (`~/.aidevops/agents/`).

## Purpose

Files in `.agents/` provide project-specific instructions that AI assistants
read when working in this repository. Use this for:

- Domain-specific conventions not covered by the framework
- Project architecture decisions and patterns
- API design rules, data models, naming conventions
- Integration details (third-party services, deployment targets)

## Adding Agents

Create `.md` files in this directory for domain-specific context:

```text
.agents/
  AGENTS.md              # This file - overview and index
  api-patterns.md        # API design conventions
  deployment.md          # Deployment procedures
  data-model.md          # Database schema and relationships
```

Each file is read on demand by AI assistants when relevant to the task.

## Security

This is a content/e-commerce site. No AI/LLM dependencies. Standard web security practices apply (CSP headers, input sanitization, dependency auditing, payment security).

If AI-powered features are added in the future (product recommendations, search, chatbot, content generation), integrate [`@stackone/defender`](https://www.npmjs.com/package/@stackone/defender) as middleware for prompt injection defense. See the [aidevops framework docs](https://github.com/marcusquinn/aidevops) `tools/security/prompt-injection-defender.md`.
