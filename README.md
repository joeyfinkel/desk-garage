# DeskGarage

A private home for the files, links, and snippets you reach for often.

## Workspace

- `apps/desktop`: Electron + React desktop app, shared by macOS and Windows.
- `apps/web`: existing website placeholder.
- `packages/containers`: Effect schemas, typed errors, storage service, and container operations.
- `packages/ui`: shadcn components, `cn`, and shared Tailwind styles.
- `packages/theme`: framework-independent CSS theme tokens.

Shared code belongs in packages. Native mobile components will consume the same design tokens rather than DOM components. Convex with Better Auth will live in a shared backend package when shared containers are implemented. Private containers remain local and do not require authentication.

## Layouts

The desktop uses `@jfdevelops/react-layout` with a central resource definition in `apps/desktop/src/utils/layout.tsx` and page factories beside their routes under `apps/desktop/src/routes`. Semantic layout regions wrap shared primitives from `packages/ui/src/layout`. Add page configuration through the central factory and keep application behavior in services and hooks.

## Routing

The desktop uses TanStack Router file routes with hash history, so packaged `file://` loads and Portless development use the same paths. The root route keeps the sidebar and container workspace mounted around its outlet. Container selection lives in `/containers/$containerId`; creation uses `/containers/new`, and recovery uses `/trash`. The `/containers` index opens the first active container, or the empty workspace if none remain.

Route-private components and utilities use `-components` and `-utils` directories, which the route generator ignores. The Vite plugin generates `src/route-tree.gen.ts` during development and builds; commit the generated tree so typechecking also works immediately after checkout. Do not edit it manually.

## Application runtime

Use Effect for application services, asynchronous workflows, resource lifecycles, and typed errors as the app grows. Keep React components focused on presentation and local interaction state. Shared services belong in workspace packages; platform-specific adapters stay with their app. Container persistence and create/trash/restore workflows use Effect 4. The desktop supplies a local-storage adapter and interprets synchronous effects at the React boundary. Mutations update the UI only after persistence succeeds; invalid stored data is reported without overwriting it.

## Develop on macOS

Use Node.js 24+ and pnpm 10.33.2:

```sh
pnpm install
pnpm dev
```

The development command starts the renderer through Portless and opens Electron at the URL provided by Portless (`https://desk-garage.localhost` with default proxy settings). Do not start a renderer server separately. The Electron binary downloads on its first invocation.

Closing the window keeps DeskGarage in the menu bar. Use the tray menu to reopen or quit it. Stop `pnpm dev` to stop the development session.

The foundation supports creating private containers, moving them to trash, and restoring them. Container metadata is stored locally in Electron's browser profile. File import, item management, permanent deletion, sync, authentication, mobile, and distribution packaging are upcoming work. This is a development app, not a packaged release.

## Development tools

The TanStack Devtools launcher opens Router and React Layout panels in development. Router shows the active route and navigation state; React Layout inspects the workspace definition, generated pages, and composables. Its Vite plugin enables source locations and temporary render-state previews. The inspector is lazy-loaded only in development and excluded from production builds.

## Checks

```sh
pnpm build
pnpm typecheck
pnpm test
pnpm format:check
```

The roadmap is private desktop containers, shared containers with authorized-device access, then mobile CRUD and incoming OS sharing. An agent interface can follow through MCP.
