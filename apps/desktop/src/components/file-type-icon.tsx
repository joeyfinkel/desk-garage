import { fileTypeIconContents, fileTypeLabel } from '../file-type-icon-svg';

export function FileTypeIcon({ name, label }: { name?: string; label?: string }) {
  return (
    <svg
      viewBox="0 0 48 56"
      className="size-8 shrink-0"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: fileTypeIconContents(fileTypeLabel(name, label)) }}
    />
  );
}
