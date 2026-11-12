import type { WorkspaceCommand, WorkspaceResponse } from './schema';

export interface DesktopBridge {
  command: (command: WorkspaceCommand) => Promise<WorkspaceResponse>;
  importDropped: (containerId: string, files: File[]) => Promise<WorkspaceResponse>;
  dragFile: (id: string) => void;
  onChanged: (listener: () => void) => () => void;
}
