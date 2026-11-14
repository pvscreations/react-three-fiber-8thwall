# CI / CD

Workflow: [`ci.yml`](./ci.yml)

## What runs

| Event | Jobs |
| --- | --- |
| Pull request → `main` | lint, Vite build, library build |
| Push → `main` | same + GitHub release, **npm publish**, **Vercel** deploy |

## Build outputs

Both use `./dist` (no separate folders):

1. `npm run build` → starter app → uploaded as `vercel_artifacts`
2. `npm run build:lib` → package → uploaded as `npm_artifacts` (overwrites `dist` after the Vercel upload)

## Secrets (repo settings)

| Secret | Used for |
| --- | --- |
| `NPM_TOKEN` | `npm publish` |
| `VERCEL_TOKEN` | Vercel deploy |
| `VERCEL_ORG_ID` | Vercel org |
| `VERCEL_PROJECT_ID` | Vercel project |

## Local

```bash
npm run dev          # starter (HTTPS)
npm run build        # starter → dist/
npm run build:lib    # npm package → dist/
```
