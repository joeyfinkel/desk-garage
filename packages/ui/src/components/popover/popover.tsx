import type { ComponentProps } from 'react';
import { Popover as PopoverPrimitive } from 'radix-ui';

export function Popover(props: ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}
