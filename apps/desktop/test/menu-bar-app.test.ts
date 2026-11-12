import { describe, expect, it } from 'vite-plus/test';
import { shouldOpenAtLogin, shouldOpenMainWindow, statusItemSuppressUntil } from '../electron/menu-bar-app';

describe('menu bar activation', () => {
  it('opens the main window for a real activation once the status-item grace has passed', () => {
    expect(shouldOpenMainWindow({ quickVisible: false, suppressUntil: 0, now: 1_000 })).toBe(true);
  });

  it('keeps a status-item click from opening the main window when activation arrives first', () => {
    const requestedAt = 5_000;
    const suppressUntil = statusItemSuppressUntil(requestedAt + 40);

    expect(shouldOpenMainWindow({ quickVisible: false, suppressUntil, now: requestedAt + 200 })).toBe(false);
  });

  it('does not open the main window while the quick panel is visible', () => {
    expect(shouldOpenMainWindow({ quickVisible: true, suppressUntil: 0, now: 1_000 })).toBe(false);
  });

  it('registers a login item only for a packaged macOS or Windows app', () => {
    expect(shouldOpenAtLogin({ packaged: true, platform: 'darwin' })).toBe(true);
    expect(shouldOpenAtLogin({ packaged: true, platform: 'win32' })).toBe(true);
    expect(shouldOpenAtLogin({ packaged: false, platform: 'darwin' })).toBe(false);
    expect(shouldOpenAtLogin({ packaged: true, platform: 'linux' })).toBe(false);
  });
});
