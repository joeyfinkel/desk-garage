import { useState } from 'react';
import { Button } from '@desk-garage/ui/button';
import { ContainerEdit } from './container-edit';
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
} from '@desk-garage/ui/sidebar';
import { useContainerWorkspace } from '../../-utils/containers';

export function WorkspaceSidebar() {
  const { containers, items, trashContainer, isWorking } = useContainerWorkspace();
  const matchRoute = useMatchRoute();
  const navigate = useNavigate();
  const [editingId, setEditingId] = useState<string>();
  const active = containers.filter((container) => !container.deletedAt);
  const trashCount =
    containers.filter((container) => container.deletedAt).length +
    items.filter((item) => item.deletedAt && containers.some((container) => container.id === item.containerId && !container.deletedAt))
      .length;

  return (
    <>
      <ContainerEdit container={active.find((container) => container.id === editingId)} onClose={() => setEditingId(undefined)} />
      <Sidebar collapsible="icon" className="top-12 h-[calc(100svh-3rem)] border-r">
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
                      className="pr-16"
                      tooltip={container.name}
                      isActive={!!matchRoute({ to: '/containers/$containerId', params: { containerId: container.id } })}
                    >
                      <Link to="/containers/$containerId" params={{ containerId: container.id }}>
                        <Folder />
                        <span>{container.name}</span>
                      </Link>
                    </SidebarMenuButton>
                    <div className="absolute right-1 top-0 flex h-8 items-center opacity-0 transition-opacity group-hover/menu-item:opacity-100 group-focus-within/menu-item:opacity-100 group-data-[collapsible=icon]:hidden">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-7"
                        aria-label={`Edit ${container.name}`}
                        onClick={() => setEditingId(container.id)}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-7"
                        disabled={isWorking}
                        aria-label={`Move ${container.name} to trash`}
                        onClick={async () => {
                          const isSelected = !!matchRoute({ to: '/containers/$containerId', params: { containerId: container.id } });

                          if ((await trashContainer(container.id)) && isSelected) {
                            void navigate({ to: '/containers', replace: true });
                          }
                        }}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
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
