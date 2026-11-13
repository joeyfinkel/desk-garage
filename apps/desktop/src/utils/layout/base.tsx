import { createDefinedResourceLayout, createProp } from '@jfdevelops/react-layout';
import { PageFrame } from '@desk-garage/ui/page-frame';
import { PageHeader } from '@desk-garage/ui/page-header';
import { PageContent } from '@desk-garage/ui/page-content';

export const workspaceLayoutDefinition = createDefinedResourceLayout({
  resources: ['workspace', 'containers', 'trash'],
  options: {
    title: createProp.component({ type: 'ReactNode' }),
    description: createProp.component({ type: 'ReactNode' }).optional(),
  },
  composables: (create) => ({
    Layout: create({ name: ({ capitalize, resource }) => `${capitalize(resource)}Layout`, wrapWith: PageFrame }),
    Header: create({ name: ({ capitalize, resource }) => `${capitalize(resource)}Header`, wrapWith: PageHeader }),
    Content: create({ name: ({ capitalize, resource }) => `${capitalize(resource)}Content`, wrapWith: PageContent }),
  }),
});

export const { defineResourceLayout, createRenderState, defineLazyDefaults, resources } = workspaceLayoutDefinition;
