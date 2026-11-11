# DeskGarage

A private home for the files, links, and snippets you reach for often.

## Workspace

- `apps/desktop`: Electron + React desktop app, shared by macOS and Windows.
- `apps/web`: existing website placeholder.
- `packages/ui`: shadcn components, `cn`, and shared Tailwind styles.
- `packages/theme`: framework-independent CSS theme tokens.

Shared code belongs in packages. Native mobile components will consume the same design tokens rather than DOM components. Convex with Better Auth will live in a shared backend package when shared containers are implemented. Private containers remain local and do not require authentication.

## Application runtime

Use Effect for application services, asynchronous workflows, resource lifecycles, and typed errors as the app grows. Keep React components focused on presentation and local interaction state. Shared services belong in workspace packages; platform-specific adapters stay with their app. The current UI foundation does not yet integrate Effect.

## Develop on macOS

Use Node.js 24+ and pnpm 10.33.2:

```sh
pnpm install
pnpm dev
```

The development command starts the renderer through Portless and opens Electron at the URL provided by Portless (`https://desk-garage.localhost` with default proxy settings). Do not start a renderer server separately. The Electron binary downloads on its first invocation.

Closing the window keeps DeskGarage in the menu bar. Use the tray menu to reopen or quit it. Stop `pnpm dev` to stop the development session.

The foundation supports creating private containers, moving them to trash, and restoring them. Container metadata is stored locally in Electron's browser profile. File import, item management, permanent deletion, sync, authentication, mobile, and distribution packaging are upcoming work. This is a development app, not a packaged release.

## Checks

```sh
pnpm build
pnpm typecheck
pnpm test
pnpm format:check
```

The roadmap is private desktop containers, shared containers with authorized-device access, then mobile CRUD and incoming OS sharing. An agent interface can follow through MCP.
