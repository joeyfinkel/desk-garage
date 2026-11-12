import { useState } from 'react';
import type { FileItem } from '@desk-garage/workspace';
import { FileTypeIcon } from './file-type-icon';

const imageExtensions = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp']);

function extension(name: string) {
  return name.split('.').pop()?.toLowerCase() ?? '';
}

export function FileMark({ item }: { item: FileItem }) {
  const [failed, setFailed] = useState(false);
  const showImage = !item.deletedAt && imageExtensions.has(extension(item.name)) && !failed;

  if (!showImage) {
    return <FileTypeIcon name={item.name} />;
  }

  return (
    <div className="size-8 shrink-0 overflow-hidden rounded-md bg-accent">
      <img src={`desk-file://local/${item.id}`} alt="" className="size-full object-cover" onError={() => setFailed(true)} />
    </div>
  );
}
