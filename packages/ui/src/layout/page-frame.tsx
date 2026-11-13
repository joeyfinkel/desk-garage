import type { ComponentProps } from 'react';
import { cn } from '../lib/utils';

export function PageFrame({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('flex min-w-0 flex-1 flex-col px-6 py-3', className)} {...props} />;
}
