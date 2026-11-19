# React Layout renderer API proposal

## Purpose

Centralize the repeated resource renderer definition and router adapter used across routes. Define the renderer once, then select a full resource path or progressively apply path segments.

This is an API specification for `react-layout`, not an implementation change to this application.

## API shape

Add `resourcePageConfig.createRenderer(options)` with a single object argument. Only `render` is required. `params`, `displayName`, and `factory` are optional.

Use the object API instead of requiring a builder chain for the initial definition. Preserve the library's existing callback and schema conventions, including `{ props, render }` definitions where applicable.

```tsx
const renderPage = resourcePageConfig.createRenderer({
  params: {
    include: {
      keys: true,
    },
  },
  render: ({ getComponentForPath, path, params }) => {
    const component = getComponentForPath(path)();

    return component[params.componentKey];
  },
  displayName: ({ path, params }) => `${path}Page${params.componentKey}`,
  factory: {
    render: (_props, { context }) => {
      const { Builder, componentKey } = context;

      return () => <Builder componentKey={componentKey} />;
    },
  },
});
```

The top-level `render` controls the configured Builder's rendering behavior. `factory.render` controls what the factory produces from that Builder and its declared parameters. These callbacks have different responsibilities and return contracts.

## Parameters

Deprecate `.addPathParams()` and `.addComponentKeyParams()` in favor of `.addParams(options)` on existing builders.

The `params` property of `createRenderer` uses the same options object:

```tsx
.addParams({
  include: {
    path: true,
    keys: true,
  },
  custom: {
    // The library's existing standard schema object.
  },
})
```

- `include.path` provides the path parameters previously supplied by `.addPathParams()`.
- `include.keys` provides the component key parameter previously supplied by `.addComponentKeyParams()`. Its exposed name remains `componentKey`.
- `custom` accepts the existing standard schema object, without introducing a separate schema format.
- `include`, `custom`, and individual inclusion flags are optional.
- Included and custom parameters are inferred in the Builder's `params` and the factory callback's `context`.
- Path and component key types narrow to the selected resource path.

Keep the deprecated methods as compatibility wrappers around `.addParams()` during migration. Existing optionality behavior must remain representable; the exact options syntax for optional included parameters must be settled before implementation.

## Factory definition

`factory` follows the library's `{ props, render }` convention. `props` is optional and follows the existing schema conventions. The second argument to `render` exposes a `context` property containing:

- The configured `Builder`.
- `componentKey` when included.
- All other parameters declared through the Builder's parameter configuration.

Do not require consumers to recover parameter types manually through `typeof Builder._args`.

`factory.render` is generic in its return type. It must not be restricted to a React node, a component, or a thunk, and must not automatically wrap its result.

For TanStack Router, the consumer explicitly returns a thunk:

```tsx
factory: {
  render: (_props, { context }) => {
    const { Builder, componentKey } = context;

    return () => <Builder componentKey={componentKey} />;
  },
}
```

Returning JSX directly instead must remain valid for consumers that need an element. Other return values must preserve their inferred types as well.

The precise distinction between schema-defined factory props and parameters supplied when invoking the resulting factory should follow the existing library conventions. The component-key shorthand below is the intended consumer experience; additional parameter invocation syntax must be specified consistently with those conventions.

## Return type

Use a `Return` generic with a default corresponding to the configured Builder type.

- Without `factory`, selecting a complete path returns the configured Builder.
- With `factory`, infer `Return` from `factory.render` and preserve it exactly.
- A thunk-returning callback produces a thunk return type; an element-returning callback produces an element return type.
- Partial path application retains the factory definition and narrows its path-dependent types as more segments are selected.
- Consumers should not need explicit generic arguments or callback parameter annotations for the normal usage shown here.

Conceptually, the callable API resolves a complete path to its configured output and a partial path to another scoped callable. This is a behavioral description, not a proposed final TypeScript declaration.

## Full and partial paths

Accept a complete path directly:

```tsx
const renderContainer = renderPage('containers.$containerId');
```

Accept a partial path and return a higher-order function for the remaining segments:

```tsx
const renderContainers = renderPage('containers');
const renderContainer = renderContainers('$containerId');
```

Both forms must resolve to equivalent behavior. Remaining path suggestions, path variables, component keys, and custom parameter types must remain inferred after partial application.

Some paths can identify both a configured page and a parent branch. Define an explicit disambiguation rule before implementation. In particular, avoid silently confusing a child path segment with a component key. An explicit path-selection method is a possible resolution, but its name and necessity are not yet agreed.

## TanStack Router usage

The shared definition removes the repeated helper:

```tsx
function renderComponent(key: typeof Builder._args.componentKey) {
  return () => <Builder componentKey={key} />;
}
```

Each route selects its resource and uses the configured factory:

```tsx
const renderComponent = renderPage('trash');

export const Route = createFileRoute('/_desktop/trash')({
  component: renderComponent('component'),
  pendingComponent: renderComponent('pendingComponent'),
  errorComponent: renderComponent('errorComponent'),
  notFoundComponent: renderComponent('notFoundComponent'),
});
```

Each slot invocation returns the thunk explicitly returned by `factory.render`, satisfying TanStack Router's requirement for a component function.

## Chainable render customization

Retain a chainable `.render()` facility for customizing render behavior. It uses the established rendering callback contract and does not force the initial definition to use a builder chain.

When the selected output is the default Builder and exposes `.render()`, consumers can use that method. With a custom factory, the selected output has exactly the inferred `Return` type: do not attach or promise Builder methods on arbitrary outputs.

Customization of the reusable renderer must remain possible before factory evaluation. The exact location of `.render()` on a scoped renderer, particularly for complete paths that immediately resolve to custom outputs, remains an API detail to settle.

Shared definitions and scoped customizations must be immutable so one route's customization does not modify another route's renderer.

## Type and behavior acceptance criteria

- A definition containing only `render` is valid.
- All optional configuration can be omitted independently.
- Included component keys are inferred without manual annotations.
- Custom schema parameters flow into rendering parameters and factory context.
- Factory context provides the correctly configured Builder.
- Factory callback return types are preserved, including thunks and direct JSX.
- The default return type is the configured Builder when `factory` is absent.
- Complete and progressively applied paths resolve equivalently.
- Invalid paths and component keys are rejected by TypeScript.
- Type inference works across sibling object properties without requiring declaration-order tricks from consumers.
- Deprecated parameter methods preserve existing behavior through compatibility wrappers.
- Route-specific customizations do not mutate shared definitions.

## Details to settle before implementation

1. Disambiguation for paths that are both pages and parent branches.
2. Invocation syntax for multiple declared parameters and optional factory props, beyond the component-key shorthand.
3. Optionality configuration for included path and component key parameters.
4. Placement of chainable render overrides before custom factory evaluation.
5. Collision handling between custom parameter names and included or reserved context names.

These details must not compromise the agreed object-based definition, optional configuration, path currying, or inferred generic factory return type.
