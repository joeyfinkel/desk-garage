import { getRouteApi } from '@tanstack/react-router';
import { useContainerWorkspace } from '../../-utils/containers';

export function useQuickContainer() {
  const { containerId } = getRouteApi('/quick').useSearch();
  const { containers } = useContainerWorkspace();
  const active = containers.filter((container) => !container.deletedAt);
  const selected = active.find((container) => container.id === containerId) ?? active[0];

  return { active, selected };
}
