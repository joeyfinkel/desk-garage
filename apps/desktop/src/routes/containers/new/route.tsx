import { createFileRoute } from '@tanstack/react-router';
import { CreateContainerPage } from './-components/page';
import { CreateContainerForm } from './-components/form';

export const Route = createFileRoute('/containers/new')({ component: CreateContainer });

function CreateContainer() {
  return (
    <CreateContainerPage title="New container">
      <CreateContainerForm />
    </CreateContainerPage>
  );
}
