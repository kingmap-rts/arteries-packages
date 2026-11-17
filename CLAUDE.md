# arteries-packages — notes for Claude

Private packages of «Артерії» published to GitHub Packages (Yarn workspaces + lerna),
modelled on `land-packages`. Each package has its own `CLAUDE.md` with conventions:
`packages/arteries-protocol`, `packages/arteries-core`.

## Package manager: Yarn only

This project uses **Yarn 4** (Berry, pinned in `package.json` → `packageManager`, run through
Corepack) with `nodeLinker: node-modules`.

- **Never use npm or npx** here: no `npm install`, `npm run`, `npm ci`, `npx …`.
  A `package-lock.json` must never appear; if one does, delete it.
- First time on a machine: `corepack enable`. Then `yarn install`.
- Run scripts with `yarn <script>` (`yarn build`, `yarn test`), local binaries with
  `yarn <bin>` (`yarn tsx …`, `yarn vitest`), one-off tools with `yarn dlx <pkg>`.
- Add dependencies with `yarn add <pkg>` / `yarn add -D <pkg>`; in a workspace:
  `yarn workspace <name> add <pkg>`. Remove with `yarn remove`.
- Workspace packages depend on each other with `"workspace:*"` (or `"workspace:^"` for
  published packages).
- `yarn.lock` is committed. CI and Docker install with `yarn install --immutable`.
- `@caspen13/*` packages come from GitHub Packages (see `.yarnrc.yml`): export `GITHUB_TOKEN`
  (a PAT with `read:packages`) before installing them. Never commit the token.

## Commands

```bash
yarn build            # every package → lib/
yarn test             # core: golden matches, rules, determinism
yarn typecheck
yarn check-quality    # ESLint
yarn check-formatting # Prettier
yarn publish:protocol # needs GITHUB_TOKEN in .env (write:packages)
yarn publish:core
```
