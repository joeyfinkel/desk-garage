interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function positionTrayPanel(anchor: Rectangle, workArea: Rectangle) {
  const width = Math.min(420, workArea.width - 16);
  const height = Math.min(580, workArea.height - 16);
  const x = Math.max(
    workArea.x + 8,
    Math.min(Math.round(anchor.x + anchor.width / 2 - width / 2), workArea.x + workArea.width - width - 8),
  );
  const below = anchor.y + anchor.height + 6;
  const y = Math.max(
    workArea.y + 8,
    Math.min(below + height <= workArea.y + workArea.height ? below : anchor.y - height - 6, workArea.y + workArea.height - height - 8),
  );

  return { x, y, width, height };
}
