import type { DesktopBridge } from '@desk-garage/workspace';

declare global {
  interface Window {
    deskGarage?: DesktopBridge;
  }
}
