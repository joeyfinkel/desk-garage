import type { ComponentProps } from 'react';
import { Popover as PopoverPrimitive } from 'radix-ui';

export function PopoverTrigger(props: ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}
