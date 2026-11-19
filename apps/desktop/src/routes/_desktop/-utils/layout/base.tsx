import { createDefinedResourceLayout } from '@jfdevelops/react-layout';
import { reactNode } from '@jfdevelops/react-layout-adapter-effect';
import { optionalReactNode } from '../../../../utils/optional-react-node';
import { PageFrame } from '@desk-garage/ui/page-frame';
import { PageHeader } from '@desk-garage/ui/page-header';
import { PageContent } from '@desk-garage/ui/page-content';

export const workspaceLayoutDefinition = createDefinedResourceLayout({
  resources: ['workspace', 'containers', 'trash'],
  options: {
    title: reactNode(),
    description: optionalReactNode(),
  },
  composables: (create) => ({
    Layout: create({ name: ({ capitalize, resource }) => `${capitalize(resource)}Layout`, wrapWith: PageFrame }),
    Header: create({ name: ({ capitalize, resource }) => `${capitalize(resource)}Header`, wrapWith: PageHeader }),
    Content: create({ name: ({ capitalize, resource }) => `${capitalize(resource)}Content`, wrapWith: PageContent }),
  }),
});

export const { defineResourceLayout, createRenderState, defineLazyDefaults, resources } = workspaceLayoutDefinition;
