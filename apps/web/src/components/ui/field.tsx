'use client';

import { useId, type InputHTMLAttributes } from 'react';

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  errors?: string[];
  hint?: string;
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
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-pitch-200 text-sm font-medium">
        {label}
      </label>
      <input
        {...props}
        id={id}
        aria-invalid={hasErrors}
        aria-describedby={describedBy.length > 0 ? describedBy : undefined}
        className={`bg-pitch-950/60 text-pitch-50 placeholder:text-pitch-600 min-h-11 rounded-[--radius-control] border px-3.5 py-2.5 text-base transition-colors ${
          hasErrors ? 'border-danger-400' : 'border-white/12 focus:border-grass-400'
        } ${className}`}
      />
      {hint !== undefined ? (
        <p id={hintId} className="text-pitch-400 text-xs">
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
