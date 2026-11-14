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

## Job order (strict)

```
build  ──(must succeed)──►  version  ──►  release_github
                                      ├──►  publish_npm
                                      └──►  deploy_vercel
```

Release / npm / Vercel **do not start** until `build` and then `version` both succeed.

| Event | Jobs |
| --- | --- |
| PR → `main` | `build` only |
| Push → `main` | `build` → `version` → release + npm + Vercel |

## Local check (same as CI build job)

```bash
npm ci
npm run lint
npm run build
npm run build:lib
```
