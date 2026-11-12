export const STATUS_ITEM_ACTIVATE_GRACE_MS = 200;

export function statusItemSuppressUntil(now: number) {
  return now + STATUS_ITEM_ACTIVATE_GRACE_MS + 50;
}

export function shouldOpenMainWindow(input: { quickVisible: boolean; suppressUntil: number; now: number }) {
  if (input.quickVisible) {
    return false;
  }

  return input.now >= input.suppressUntil;
}

export function shouldOpenAtLogin(input: { packaged: boolean; platform: NodeJS.Platform }) {
  return input.packaged && (input.platform === 'darwin' || input.platform === 'win32');
}
