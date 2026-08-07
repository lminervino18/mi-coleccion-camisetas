'use client';

import { useId, type InputHTMLAttributes } from 'react';

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  errors?: string[] | undefined;
  hint?: string | undefined;
};

/**
 * Errors are wired to the input through aria-describedby and aria-invalid so screen readers
 * announce them; the legacy forms rendered messages with no association at all.
 */
export const Field = ({ label, errors, hint, className = '', ...props }: FieldProps) => {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const hasErrors = errors !== undefined && errors.length > 0;

  const describedBy = [hint !== undefined ? hintId : null, hasErrors ? errorId : null]
    .filter((value) => value !== null)
    .join(' ');

  return (
    <div className="flex flex-col gap-1.5 text-left">
      <label htmlFor={id} className="text-ink-300 text-sm">
        {label}
      </label>
      <input
        {...props}
        id={id}
        aria-invalid={hasErrors}
        aria-describedby={describedBy.length > 0 ? describedBy : undefined}
        className={`text-ink-100 placeholder:text-ink-500 min-h-11 rounded-[6px] border bg-black/45 px-3.5 py-2.5 text-base transition-colors ${
          hasErrors ? 'border-danger-400' : 'focus:border-celeste-400 border-white/12'
        } ${className}`}
      />
      {hint !== undefined ? (
        <p id={hintId} className="text-ink-500 text-xs">
          {hint}
        </p>
      ) : null}
      {hasErrors ? (
        <p id={errorId} className="text-danger-400 text-sm">
          {errors.join(' ')}
        </p>
      ) : null}
    </div>
  );
};
