'use client';

import { useEffect, useRef } from 'react';
import { Button } from './button';

type ConfirmDialogProps = {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  isBusy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children?: React.ReactNode;
};

/**
 * Built on <dialog> so the browser provides the focus trap, Escape handling and inertness that
 * the previous hand-rolled overlays lacked.
 */
export const ConfirmDialog = ({
  isOpen,
  title,
  description,
  confirmLabel,
  isBusy = false,
  onConfirm,
  onCancel,
  children,
}: ConfirmDialogProps) => {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const element = dialog.current;
    if (element === null) return;

    if (isOpen && !element.open) element.showModal();
    if (!isOpen && element.open) element.close();
  }, [isOpen]);

  return (
    <dialog
      ref={dialog}
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
      onClose={onCancel}
      aria-labelledby="confirm-title"
      aria-describedby="confirm-description"
      className="panel text-ink-100 m-auto w-[min(28rem,calc(100vw-2rem))] p-5 backdrop:bg-black/70"
    >
      <h2 id="confirm-title" className="font-display mb-2 text-lg font-bold">
        {title}
      </h2>
      <p id="confirm-description" className="text-ink-300 mb-4 text-sm">
        {description}
      </p>
      {children === undefined ? null : <div className="mb-5">{children}</div>}
      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="secondary" onClick={onCancel} disabled={isBusy}>
          Cancelar
        </Button>
        <Button variant="danger" onClick={onConfirm} isLoading={isBusy}>
          {confirmLabel}
        </Button>
      </div>
    </dialog>
  );
};
