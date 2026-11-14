# CI / CD

Workflow: [`ci.yml`](./ci.yml)

## npm — Trusted publishing (no `NPM_TOKEN`)

CI publishes with **OIDC** (GitHub ↔ npm). No long-lived npm token in GitHub secrets.

### One-time setup on npmjs.com

1. Open [npmjs.com/package/react-three-fiber-8thwall](https://www.npmjs.com/package/react-three-fiber-8thwall) while logged in as the package owner.
2. **Settings** → **Trusted Publisher** → **GitHub Actions**.
3. Fill in exactly:
   - **Organization or user:** `nagendra-dharmireddi0`
   - **Repository:** `react-three-fiber-8thwall`
   - **Workflow filename:** `ci.yml` (filename only, not a path)
   - **Environment:** leave empty (we don’t use GitHub Environments)
4. Allow **`npm publish`** (and stage if you want).
5. Save.

Optional: delete any old `NPM_TOKEN` repository secret — it is unused now.

Docs: [Trusted publishing for npm packages](https://docs.npmjs.com/trusted-publishers/)

## Secrets — Repository secrets (not Environment)

GitHub → repo → **Settings** → **Secrets and variables** → **Actions** → **Repository secrets**.

Do **not** put these under Environments unless you also add `environment: ...` to the job in `ci.yml` (we don’t).

| Secret | Where to get it |
| --- | --- |
| `VERCEL_TOKEN` | vercel.com → Account Settings → Tokens |
| `VERCEL_ORG_ID` | from `.vercel/project.json` → `orgId` (after `npx vercel link`) |
| `VERCEL_PROJECT_ID` | from `.vercel/project.json` → `projectId` |

Token must belong to an account that can access that Vercel team/project.

## Job order (strict)

```
build  ──(must succeed)──►  version  ──►  release_github
                                      ├──►  publish_npm  (OIDC)
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
