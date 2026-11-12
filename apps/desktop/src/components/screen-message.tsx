import type { ComponentPropsWithRef } from 'react';
import { cn } from '@desk-garage/ui/cn';

export function ScreenMessage({ className, ...props }: ComponentPropsWithRef<'div'>) {
  return (
    <div
      data-slot="screen-message"
      className={cn('flex flex-1 flex-col items-center justify-center gap-3 px-6 py-8 text-center', className)}
      {...props}
    />
  );
}

export function ScreenMessageIcon({ className, ...props }: ComponentPropsWithRef<'div'>) {
  return <div data-slot="screen-message-icon" className={cn('text-primary', className)} {...props} />;
}

export function ScreenMessageTitle({ className, ...props }: ComponentPropsWithRef<'p'>) {
  return <p data-slot="screen-message-title" className={cn('font-semibold', className)} {...props} />;
}

export function ScreenMessageDescription({ className, ...props }: ComponentPropsWithRef<'p'>) {
  return <p data-slot="screen-message-description" className={cn('max-w-72 text-sm text-muted-foreground', className)} {...props} />;
}

export function ScreenMessageActions({ className, ...props }: ComponentPropsWithRef<'div'>) {
  return <div data-slot="screen-message-actions" className={cn('mt-2 flex flex-wrap justify-center gap-2', className)} {...props} />;
}
