import { createRenderState } from './base';
import { layoutState } from './layout-state';

export const defaultState = createRenderState({
  state: 'default',
  props: layoutState.Layout.props,
  composables: () => ({ LayoutState: layoutState.asComposable() }),
  render: function DefaultState(props, { composables }) {
    return <composables.LayoutState {...props} />;
  },
});
