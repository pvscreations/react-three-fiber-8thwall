# CI / CD

Workflow: [`ci.yml`](./ci.yml)

## Secrets — Repository secrets (not Environment)

GitHub → repo → **Settings** → **Secrets and variables** → **Actions** → **Repository secrets**.

Do **not** put these under Environments unless you also add `environment: ...` to the job in `ci.yml` (we don’t).

| Secret | Where to get it |
| --- | --- |
| `NPM_TOKEN` | npmjs.com → Access Tokens |
| `VERCEL_TOKEN` | vercel.com → Account Settings → Tokens |
| `VERCEL_ORG_ID` | from `.vercel/project.json` → `orgId` (after `npx vercel link`) |
| `VERCEL_PROJECT_ID` | from `.vercel/project.json` → `projectId` |

Your local link file has:

- `orgId` → `VERCEL_ORG_ID`
- `projectId` → `VERCEL_PROJECT_ID`

Token must belong to an account that can access that Vercel team/project.

## What runs

| Event | Jobs |
| --- | --- |
| PR → `main` | lint, Vite build, library build |
| Push → `main` | same + GitHub release, npm publish, Vercel deploy |

## Local check (same as CI build job)

```bash
npm ci
npm run lint
npm run build
npm run build:lib
```
