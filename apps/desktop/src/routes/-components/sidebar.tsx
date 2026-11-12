import { Link, useMatchRoute } from '@tanstack/react-router';
import { Folder, HardDrive, House, Plus, Trash2 } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@desk-garage/ui/sidebar';
import { useContainerWorkspace } from '../-utils/containers';

export function WorkspaceSidebar() {
  const { containers } = useContainerWorkspace();
  const matchRoute = useMatchRoute();
  const active = containers.filter((container) => !container.deletedAt);
  const trashCount = containers.filter((container) => container.deletedAt).length;

  return (
    <Sidebar collapsible="icon" className="top-8 h-[calc(100svh-2rem)] border-r">
      <SidebarHeader className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/containers">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <House size={20} />
                </div>
                <div className="grid flex-1 text-left">
                  <span className="font-semibold">DeskGarage</span>
                  <span className="truncate text-xs text-muted-foreground">A place for useful things.</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Private containers</SidebarGroupLabel>
          <SidebarGroupAction asChild>
            <Link to="/containers/new" aria-label="Create container">
              <Plus />
            </Link>
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu>
              {active.map((container) => (
                <SidebarMenuItem key={container.id}>
                  <SidebarMenuButton
                    asChild
                    tooltip={container.name}
                    isActive={!!matchRoute({ to: '/containers/$containerId', params: { containerId: container.id } })}
                  >
                    <Link to="/containers/$containerId" params={{ containerId: container.id }}>
                      <Folder />
                      <span>{container.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="New container">
                  <Link to="/containers/new">
                    <Plus />
                    <span>New container</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
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
  );
}
