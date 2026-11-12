import { createProp } from '@jfdevelops/react-layout';
import { createRenderState } from './base';

// TODO this should onlyh be used to build the other stats, this should not be used directly as a state
export const layoutState = createRenderState({
  state: 'Layout',
  props: {
    include: { title: true, description: 'optional' },
    custom: {
      children: createProp.component({ type: 'ReactNode' }),
      summary: createProp.component({ type: 'ReactNode' }).optional(),
    },
  },
  render: function LayoutState({ title, description, summary, children }, { composables }) {
    return (
      <composables.Layout aria-label={typeof title === 'string' ? title : undefined}>
        {(summary ?? description) && <p className="mb-5 whitespace-pre-wrap text-sm text-muted-foreground">{summary ?? description}</p>}
        <composables.Content>{children}</composables.Content>
      </composables.Layout>
    );
  },
});
