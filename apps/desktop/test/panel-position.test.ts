import { describe, expect, it } from 'vite-plus/test';
import { positionTrayPanel } from '../electron/panel-position';

describe('tray panel position', () => {
  it('fits below a macOS menu bar without leaving the screen', () => {
    const panel = positionTrayPanel({ x: 1400, y: 0, width: 24, height: 24 }, { x: 0, y: 24, width: 1440, height: 876 });
    expect(panel.x + panel.width).toBeLessThanOrEqual(1432);
    expect(panel.y).toBeGreaterThanOrEqual(32);
    expect(panel.y + panel.height).toBeLessThanOrEqual(892);
  });

  it('opens above a bottom Windows taskbar', () => {
    const panel = positionTrayPanel({ x: 1600, y: 1040, width: 24, height: 40 }, { x: 0, y: 0, width: 1920, height: 1040 });
    expect(panel.y + panel.height).toBeLessThan(1040);
  });

  it('respects negative monitor coordinates and small work areas', () => {
    const panel = positionTrayPanel({ x: -900, y: 0, width: 24, height: 24 }, { x: -1024, y: 24, width: 1024, height: 500 });
    expect(panel.x).toBeGreaterThanOrEqual(-1016);
    expect(panel.x + panel.width).toBeLessThanOrEqual(-8);
    expect(panel.y + panel.height).toBeLessThanOrEqual(516);
  });
});
