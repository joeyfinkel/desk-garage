import { createResourceLayout } from '../../../../utils/layout/layout';

const createContainersPage = createResourceLayout.forResource({ resource: 'containers' });

export const GaragePage = createContainersPage({ name: 'GaragePage', title: 'Your garage' });
export const ContainerPage = createContainersPage({ name: 'ContainerPage', title: 'Container files' });
