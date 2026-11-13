import type { ReactNode } from 'react';
import { Atom } from 'effect/reactivity';
import { make as makeScopedAtom, useAtom } from '@effect/atom-react';
import { Dialog } from '@desk-garage/ui/dialog';

const openState = makeScopedAtom(() => Atom.make(false));

export function TriggerDialog({ children }: { children: ReactNode }) {
  return (
    <openState.Provider>
      <ControlledDialog>{children}</ControlledDialog>
    </openState.Provider>
  );
}

export function useTriggerDialog() {
  const [isOpen, setIsOpen] = useAtom(openState.use());

  return { isOpen, close: () => setIsOpen(false) };
}

function ControlledDialog({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useAtom(openState.use());

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {children}
    </Dialog>
  );
}
