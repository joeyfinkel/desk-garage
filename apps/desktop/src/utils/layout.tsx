import { createProp, defineResourceLayout } from '@jfdevelops/react-layout';
import { PageFrame } from '@desk-garage/ui/page-frame';
import { PageHeader } from '@desk-garage/ui/page-header';
import { PageContent } from '@desk-garage/ui/page-content';

export const workspaceLayout = defineResourceLayout({
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
        subtitle: createProp.component({ type: 'ReactNode' }).optional(),
        title: createProp.component({ type: 'ReactNode' }),
        children: createProp.component({ type: 'ReactNode' }),
        eyebrow: createProp.component({ type: 'ReactNode' }).optional(),
        actions: createProp.component({ type: 'ReactNode' }).optional(),
        footer: createProp.component({ type: 'ReactNode' }).optional(),
      },
    },
    render: function ResourcePage({ title, description, subtitle, children, actions, eyebrow, footer }, { composables }) {
      return (
        <composables.Layout>
          {(subtitle === undefined ? description : subtitle) && (
            <p className="mb-5 whitespace-pre-wrap text-sm text-muted-foreground">{subtitle === undefined ? description : subtitle}</p>
          )}
          <composables.Content>{children}</composables.Content>
          {footer}
        </composables.Layout>
      );
    },
  },
});

export const { createResourceLayout } = workspaceLayout;
