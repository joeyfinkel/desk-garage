import { createFileRoute } from '@tanstack/react-router';
import { TrashList } from '../../../components/trash-list';

export const Route = createFileRoute('/quick/trash')({ component: QuickTrash });

function QuickTrash() {
  return (
    <div className="flex min-h-full flex-1 flex-col gap-4">
      <h2 className="font-semibold">Trash</h2>
      <TrashList />
    </div>
  );
}
