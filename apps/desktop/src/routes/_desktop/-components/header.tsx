import { Link, useMatchRoute } from '@tanstack/react-router';
import { cn } from '@desk-garage/ui/cn';
import { SidebarTrigger, useSidebar } from '@desk-garage/ui/sidebar';
import { useContainerWorkspace } from '../../-utils/containers';
import { ContainerActions } from './container-actions';

export function DesktopHeader() {
  const matchRoute = useMatchRoute();
  const { open, isMobile, openMobile } = useSidebar();
  const isExpanded = isMobile ? openMobile : open;
  const { containers } = useContainerWorkspace();
  const match = matchRoute({ to: '/containers/$containerId' });
  const selected = match && containers.find((container) => container.id === match.containerId && !container.deletedAt);
  const title = matchRoute({ to: '/containers/new' })
    ? 'New container'
    : matchRoute({ to: '/trash' })
      ? 'Trash'
      : selected
        ? selected.name
        : 'Your garage';

  return (
    <header className="desktop-drag-region flex h-12 shrink-0 items-center border-b bg-background">
      <div className={cn('flex h-full shrink-0 items-center gap-3 pl-24', isExpanded && 'w-(--sidebar-width) border-r pr-3')}>
        <SidebarTrigger className="desktop-no-drag shrink-0" />
        {isExpanded && (
          <Link to="/containers" className="desktop-no-drag truncate text-sm font-semibold">
            Desk Garage
          </Link>
        )}
      </div>
      <div className={cn('flex min-w-0 flex-1 items-center gap-3 pr-4', isExpanded ? 'pl-4' : 'pl-3')}>
        <h1 className="min-w-0 flex-1 truncate text-sm font-semibold">{title}</h1>
        {selected && <ContainerActions key={selected.id} container={selected} />}
      </div>
    </header>
  );
}
