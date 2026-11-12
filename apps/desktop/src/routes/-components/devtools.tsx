import { TanStackDevtools } from '@tanstack/react-devtools';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import { ReactLayoutDevtoolsContent } from '@jfdevelops/react-layout-devtools-react';
import { workspaceLayout } from '../../utils/layout/layout';

export default function Devtools() {
  return (
    <TanStackDevtools
      plugins={[
        { name: 'TanStack Router', render: <TanStackRouterDevtoolsPanel /> },
        { name: 'React Layout', render: <ReactLayoutDevtoolsContent source={workspaceLayout} /> },
      ]}
    />
  );
}
