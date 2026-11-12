import { createProp, defineResourceLayout } from '@jfdevelops/react-layout';
import { PageFrame } from '@desk-garage/ui/page-frame';
import { PageHeader } from '@desk-garage/ui/page-header';
import { PageContent } from '@desk-garage/ui/page-content';

export const { createResourceLayout } = defineResourceLayout({
  resources: ['containers', 'trash'],
  options: {
    description: createProp.component({ type: 'ReactNode' }),
  },
  layout: {
    composables: (create) => ({
      Layout: create({ name: ({ capitalize, resource }) => `${capitalize(resource)}Layout`, wrapWith: PageFrame }),
      Header: create({ name: ({ capitalize, resource }) => `${capitalize(resource)}Header`, wrapWith: PageHeader }),
      Content: create({ name: ({ capitalize, resource }) => `${capitalize(resource)}Content`, wrapWith: PageContent }),
    }),
    props: {
      include: { description: true },
      custom: {
        title: createProp.component({ type: 'ReactNode' }),
        children: createProp.component({ type: 'ReactNode' }),
        eyebrow: createProp.component({ type: 'ReactNode' }).optional(),
        actions: createProp.component({ type: 'ReactNode' }).optional(),
        footer: createProp.component({ type: 'ReactNode' }).optional(),
      },
    },
    render: function ResourcePage({ title, description, children, eyebrow, actions, footer }, { composables }) {
      return (
        <composables.Layout>
          <composables.Header title={title} description={description} eyebrow={eyebrow} actions={actions} />
          <composables.Content>{children}</composables.Content>
          {footer}
        </composables.Layout>
      );
    },
  },
});
