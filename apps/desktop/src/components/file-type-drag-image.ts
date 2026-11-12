import { fileTypeIconSvg } from '../file-type-icon-svg';

const images = new Map<string, HTMLImageElement>();

export function fileTypeDragImage(label: string) {
  const cached = images.get(label);

  if (cached) {
    return cached;
  }

  const image = new Image();
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(fileTypeIconSvg(label))}`;
  images.set(label, image);

  return image;
}
