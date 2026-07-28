# AGENTS.md

Guidance for AI agents working in this repository.

## Project overview

**DSA Lending Pro** (`Dsa-Lending-pro`) is intended to be a website for lending partners. As of the initial repository state, the codebase contains only:

- `README.md` — minimal project description
- `LICENSE` — Apache 2.0

There is **no application source code**, dependency manifests, Docker configuration, CI workflows, or test suites yet. A draft PR ([#1](https://github.com/Niravbodana/Dsa-Lending-pro/pull/1)) titled "[WIP] isa website for lending partners" exists on branch `copilot/fix-299833219-1315164275-4ecac183-2e31-412b-bed3-10d7fe841bdb` but has not added any files.

## Cursor Cloud specific instructions

### Current state

No services need to be started. There is nothing to build, lint, test, or run until application code is added to the repository.

### Available tooling in the Cloud VM

The VM provides standard development tools out of the box:

| Tool | Version (approx.) |
|------|-------------------|
| Node.js | v22.x |
| npm | v10.x |
| Python | 3.12.x |
| git / gh | available |

### When application code is added

Once dependency manifests appear (e.g. `package.json`, `requirements.txt`, `docker-compose.yml`), update this section with:

1. **Install command** — e.g. `npm install`, `pip install -r requirements.txt`
2. **Dev server** — e.g. `npm run dev`
3. **Lint / test** — e.g. `npm run lint`, `npm test`
4. **Required services** — databases, caches, or other backing services and how to start them

Until then, agents should focus on implementing or reviewing the initial application scaffold rather than running services.

### Git branches

- `main` — default branch; contains only the initial commit
- `copilot/fix-299833219-1315164275-4ecac183-2e31-412b-bed3-10d7fe841bdb` — WIP branch for the lending partners website (no file changes yet)

### Secrets and environment variables

None are defined. When the application is scaffolded, add a `.env.example` and document required variables here.
