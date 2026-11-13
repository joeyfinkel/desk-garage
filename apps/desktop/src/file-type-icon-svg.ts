export function fileTypeLabel(name?: string, customLabel?: string) {
  const extension = customLabel ?? (name?.includes('.') ? name.split('.').pop() : 'file') ?? 'file';

  return extension.slice(0, 4).toUpperCase();
}

export function fileTypeIconContents(label: string) {
  const fontSize = label.length > 3 ? 8 : 10;

  return `<path d="M6 6.5A4.5 4.5 0 0 1 10.5 2H28l14 14v31.5A6.5 6.5 0 0 1 35.5 54h-25A6.5 6.5 0 0 1 4 47.5v-41Z" fill="white" stroke="#9aa396" stroke-width="2"/><path d="M28 2v12.5A1.5 1.5 0 0 0 29.5 16H42" fill="#e7eee4" stroke="#9aa396" stroke-width="2"/><text x="24" y="40" text-anchor="middle" fill="#314236" font-family="ui-sans-serif, system-ui, sans-serif" font-size="${fontSize}" font-weight="700">${escapeXml(label)}</text>`;
}

export function fileTypeIconSvg(label: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 56" width="48" height="56">${fileTypeIconContents(label)}</svg>`;
}

function escapeXml(value: string) {
  return value.replace(/[&<>"']/g, (char) => {
    const escaped = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[char];

    return escaped ?? char;
  });
}
