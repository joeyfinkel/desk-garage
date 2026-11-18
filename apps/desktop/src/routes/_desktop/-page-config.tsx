import { createResourceConfig } from './-utils/layout/layout';
import { containersConfig } from './containers/-utils/routing/config';
import { trashConfig } from './trash/-utils/routing/config';

export const resourcePageConfig = createResourceConfig({
  ...containersConfig,
  ...trashConfig,
});

export const renderPage = resourcePageConfig.createRenderer({
  params: {
    include: {
      keys: true,
    },
  },
  render: ({ getComponentForPath, path, params }) => {
    const component = getComponentForPath(path)();

    return component[params.componentKey];
  },
  displayName: {
    containers: ({ path }) => path.create(path.capitalize(), 'Page'),
    'containers.detail': ({ path }) =>
      path.create(
        path.capitalize({
          join: {
            capitalizeSegments: true,
            removeDelimiter: true,
          },
        }),
        'Page',
      ),
    'containers.new': ({ path }) => path.create(path.segments.new.capitalize(), path.segments.containers.capitalize(), 'Page'),
    trash: ({ path }) => path.create(path.capitalize(), 'Page'),
    '*': ({ path, params, capitalize }) => path.create(path.capitalize(), capitalize(params.componentKey)),
  },
  factory: {
    render: (_props, { context }) => {
      const { Component, componentKey } = context;

      return () => <Component componentKey={componentKey} />;
    },
  },
});
