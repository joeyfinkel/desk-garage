import { createResourceLayout } from '../utils/layout';

const createContainersPage = createResourceLayout.forResource({ resource: 'containers' });

export const ContainersPage = createContainersPage({
  name: 'ContainersPage',
  description: 'Keep the things you reach for close at hand.',
});

export const CreateContainerPage = createContainersPage({
  name: 'CreateContainerPage',
  description: 'Keep the things you reach for close at hand.',
});

export const TrashPage = createResourceLayout({
  name: 'TrashPage',
  resource: 'trash',
  description: 'Recover containers you have removed.',
});
