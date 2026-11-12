# DeskGarage

A private home for the files, links, and snippets you reach for often.

## Workspace

- `apps/desktop`: Electron + React desktop app, shared by macOS and Windows.
- `apps/web`: existing website placeholder.
- `packages/containers`: Effect schemas, typed errors, storage service, and container operations.
- `packages/workspace`: shared workspace/file schemas, bridge contracts, and typed errors.
- `packages/ui`: shadcn components, `cn`, and shared Tailwind styles.
- `packages/theme`: framework-independent CSS theme tokens.

Shared code belongs in packages. Native mobile components will consume the same design tokens rather than DOM components. Convex with Better Auth will live in a shared backend package when shared containers are implemented. Private containers remain local and do not require authentication.

## Layouts

The desktop uses `@jfdevelops/react-layout` with a central resource definition in `apps/desktop/src/utils/layout/base.tsx` and page factories beside their routes under `apps/desktop/src/routes`. Semantic layout regions wrap shared primitives from `packages/ui/src/layout`. Bind page titles and descriptions in route-local configs through the central factory (`forResource` when creating related pages). The base uses `createDefinedResourceLayout` to bind resources, options, and composables. Separate `createRenderState` fragments compose the shared `Layout`, default, loading, error, and not-found views in `utils/layout/layout.tsx`; the default state reuses `layoutState.asComposable()`. Each desktop route composes its own page in route-private routing modules, with a content state and explicit pending/error/not-found adapters for TanStack Router. Runtime content belongs in slots, while application behavior stays in services and hooks. Both window shells gate their content on the initial workspace read, with retry for failures and separate messages for failed operations. Container editing uses a shared shadcn dialog.

## Routing

The desktop uses TanStack Router file routes with hash history, so packaged `file://` loads and Portless development use the same paths. The root route owns the container workspace. A persistent `_desktop` pathless route keeps the shadcn sidebar around the full-window outlet; `/quick` has its own compact shell. Container selection lives in `/containers/$containerId`; creation uses `/containers/new`, and recovery uses `/trash`. The `/containers` index opens the first active container, or the empty workspace if none remain.

Route-private components and utilities use `-components` and `-utils` directories, which the route generator ignores. The Vite plugin generates `src/route-tree.gen.ts` during development and builds; commit the generated tree so typechecking also works immediately after checkout. Do not edit it manually.

## Application runtime

Use Effect for application services, asynchronous workflows, resource lifecycles, and typed errors as the app grows. Keep React components focused on presentation and local interaction state. Shared services belong in workspace packages; platform-specific adapters stay with their app. Container persistence and create/trash/restore workflows use Effect 4. The native desktop process owns disk storage and serializes workspace operations with an Effect semaphore. A sandboxed preload exposes a narrow, validated command bridge. React interprets Effect results at the UI boundary. Mutations update the UI only after persistence succeeds; invalid stored data is reported without overwriting it.

## Develop on macOS

Use Node.js 24+ and pnpm 10.33.2:

```sh
pnpm install
pnpm dev
```

The development command starts the renderer through Portless and opens Electron at the URL provided by Portless (`https://desk-garage.localhost` with default proxy settings). Do not start a renderer server separately. The Electron binary downloads on its first invocation.

DeskGarage stays in the menu bar without a Dock icon until the full window is opened. Closing that window leaves the status icon running. A packaged build also opens at login, still without showing a window. Click its status icon for quick access: switch or create containers, import and export files, remove items or containers, and recover them from trash. That click opens only the panel. The expand button opens the full window at the selected container. Right-click the status icon for the full-window and Quit actions. While DeskGarage is focused, **Window → Quick Access** (`Cmd/Ctrl+Shift+Space`) opens the same panel.

The panel hides on click-away or Escape and stays open for native file dialogs. The full window is created only when requested; closing it releases its renderer while DeskGarage stays in the tray. The compact and full windows receive native change notifications, with revision checks preventing stale responses from rolling back either view. Stop `pnpm dev` to stop the development session.

Private containers support file import through the native picker or drag and drop (up to 100 regular files per batch). Files are copied into `app.getPath('userData')/workspace/files`; atomic metadata updates live in `workspace/workspace.json`. Imports never move the originals or load entire files into the renderer. Existing browser-stored containers migrate once, retaining their original browser-storage backup.

Drag a saved file out or use **Save a copy** to export it. Removing a file moves it to recoverable trash. Removing a container hides its files together; restoring it preserves any files that were already individually trashed. Restore a container before recovering its individually trashed files. Permanent deletion, sync, authentication, mobile, and distribution packaging are upcoming work.

`pnpm dev` builds the native TypeScript entry before opening Electron. Restart it after main-process or preload edits. Renderer edits hot reload through Portless.

## Development tools

The TanStack Devtools launcher opens Router and React Layout panels in development. Router shows the active route and navigation state; React Layout inspects the workspace definition, generated pages, and composables. Its Vite plugin enables source locations and temporary render-state previews. The inspector is lazy-loaded only in development and excluded from production builds.

## Checks

```sh
pnpm build
pnpm typecheck
pnpm test
pnpm format:check
```

GitHub Actions runs that sequence on every push and pull request. The build step compiles the desktop app: the Electron main process and the renderer.

## Releases

The release channel is the branch a pull request targets. The release runs only after that pull request is merged. Merging into `alpha` publishes an alpha, merging into `beta` publishes a beta, and merging into `main` publishes a stable version. A direct push does not publish. Run `pnpm changeset`, pick the packages this change releases, pick patch, minor, or major, and write the note. That writes a file under `.changes/`. Each line names one package:

```md
patch desk-garage-desktop
minor @desk-garage/ui

The Dock icon uses the garage drawing.
```

A package that is not named keeps its current version. Run `pnpm changeset` again when another package needs a different bump. A pull request needs one of these files. When several files name the same package, the highest bump wins. A patch stays on that package's current core and advances its alpha or beta counter. A minor or major moves the core, so `1.0.0-alpha.4` with a minor becomes `1.1.0-alpha.0`. The first stable release of a prerelease core is that core for a patch (`1.0.0-beta.3` becomes `1.0.0`), `1.1.0` for a minor, or `2.0.0` for a major. A prerelease cut from a stable version applies the bump first, so a patch after `1.0.0` is `1.0.1-alpha.0`. Each release writes the new version only into the named packages and removes the change files. The GitHub release tag is `desk-garage-desktop`'s version, and that release is skipped when the changeset does not name the desktop app. The follow-up commit is `chore(release): prepare <tag>`, and that commit does not cut another release. An alpha or beta release also attaches unsigned Mac zip files for Apple silicon and Intel. A stable release on `main` does the same. Gatekeeper will ask you to open the app from the Finder the first time.

The roadmap is private desktop containers, shared containers with authorized-device access, then mobile CRUD and incoming OS sharing. An agent interface can follow through MCP.
