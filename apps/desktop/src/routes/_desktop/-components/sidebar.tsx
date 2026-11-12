import { ContainerEdit } from '../../../components/container-edit';
import { ContainerCreate } from '../../../components/container-create';
import { ContainerDelete } from '../../../components/container-delete';
import { Link, useMatchRoute, useNavigate } from '@tanstack/react-router';
import { Folder, HardDrive, Pencil, Plus, Trash2 } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuAction,
} from '@desk-garage/ui/sidebar';
import { useContainerWorkspace } from '../../-utils/containers';

export function WorkspaceSidebar() {
  const { containers, items, isWorking } = useContainerWorkspace();
  const matchRoute = useMatchRoute();
  const navigate = useNavigate();
  const active = containers.filter((container) => !container.deletedAt);
  const trashCount =
    containers.filter((container) => container.deletedAt).length +
    items.filter((item) => item.deletedAt && containers.some((container) => container.id === item.containerId && !container.deletedAt))
      .length;

  return (
    <>
      <Sidebar collapsible="icon" className="top-12 h-[calc(100svh-3rem)] border-r">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Private containers</SidebarGroupLabel>
            <ContainerCreate
              onCreated={(id) => {
                void navigate({ to: '/containers/$containerId', params: { containerId: id } });
              }}
            >
              <SidebarGroupAction aria-label="Create container" disabled={isWorking}>
                <Plus />
              </SidebarGroupAction>
            </ContainerCreate>
            <SidebarGroupContent>
              <SidebarMenu>
                {active.map((container) => (
                  <SidebarMenuItem key={container.id}>
                    <SidebarMenuButton
                      asChild
                      className="pr-16"
                      tooltip={container.name}
                      isActive={!!matchRoute({ to: '/containers/$containerId', params: { containerId: container.id } })}
                    >
                      <Link to="/containers/$containerId" params={{ containerId: container.id }}>
                        <Folder />
                        <span>{container.name}</span>
                      </Link>
                    </SidebarMenuButton>
                    <ContainerEdit container={container}>
                      <SidebarMenuAction showOnHover className="right-7" aria-label={`Edit ${container.name}`} disabled={isWorking}>
                        <Pencil />
                      </SidebarMenuAction>
                    </ContainerEdit>
                    <ContainerDelete
                      container={container}
                      onDeleted={() => {
                        if (matchRoute({ to: '/containers/$containerId', params: { containerId: container.id } })) {
                          void navigate({ to: '/containers', replace: true });
                        }
                      }}
                    >
                      <SidebarMenuAction showOnHover aria-label={`Move ${container.name} to trash`} disabled={isWorking}>
                        <Trash2 />
                      </SidebarMenuAction>
                    </ContainerDelete>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="p-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Trash" isActive={!!matchRoute({ to: '/trash' })}>
                <Link to="/trash">
                  <Trash2 />
                  <span>Trash</span>
                </Link>
              </SidebarMenuButton>
              <SidebarMenuBadge>{trashCount}</SidebarMenuBadge>
            </SidebarMenuItem>
          </SidebarMenu>
          <div className="flex items-center gap-2 border-t pt-4 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
            <HardDrive size={14} />
            Stored on this device
          </div>
        </SidebarFooter>
      </Sidebar>
    </>
  );
}
