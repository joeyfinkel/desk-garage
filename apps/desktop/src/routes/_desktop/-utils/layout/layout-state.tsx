import { optionalReactNode } from '../../../../utils/optional-react-node';
import { createRenderState } from './base';

export const layoutState = createRenderState({
  state: 'Layout',
  props: {
    include: { title: true, description: 'optional' },
    custom: {
      summary: optionalReactNode(),
    },
  },
  render: function LayoutState({ title, description, summary, children }, { composables }) {
    return (
      <composables.Layout className="min-h-full" aria-label={typeof title === 'string' ? title : undefined}>
        {(summary ?? description) && <p className="mb-5 whitespace-pre-wrap text-sm text-muted-foreground">{summary ?? description}</p>}
        <composables.Content>{children}</composables.Content>
      </composables.Layout>
    );
  },
});
