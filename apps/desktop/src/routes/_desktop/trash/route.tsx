import { createFileRoute } from '@tanstack/react-router';
import { TrashPage } from './-components/page';
import { TrashList } from '../../../components/trash-list';

export const Route = createFileRoute('/_desktop/trash')({ component: Trash });

function Trash() {
  return (
    <TrashPage title="Trash">
      <TrashList />
    </TrashPage>
  );
}
