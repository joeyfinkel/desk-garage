import type { ComponentProps } from 'react';
import { Dialog as DialogPrimitive } from 'radix-ui';

export function DialogPortal(props: ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal {...props} />;
}
