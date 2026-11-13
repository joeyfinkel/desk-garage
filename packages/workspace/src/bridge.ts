import type { WorkspaceCommand, WorkspaceResponse } from './schema';

export interface DesktopBridge {
  openMain: (containerId?: string) => Promise<void>;
  hideQuick: () => void;
  command: (command: WorkspaceCommand) => Promise<WorkspaceResponse>;
  importDropped: (containerId: string, files: File[]) => Promise<WorkspaceResponse>;
  dragFile: (id: string) => void;
  onChanged: (listener: () => void) => () => void;
}
