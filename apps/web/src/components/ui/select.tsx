'use client';

import { useId, type SelectHTMLAttributes } from 'react';

type Option = { value: string; label: string };

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: readonly Option[];
  errors?: string[] | undefined;
};

export const SelectField = ({
  label,
  options,
  errors,
  className = '',
  ...props
}: SelectFieldProps) => {
  const id = useId();
  const errorId = `${id}-error`;
  const hasErrors = errors !== undefined && errors.length > 0;

  return (
    <div className="flex flex-col gap-1.5 text-left">
      <label htmlFor={id} className="text-ink-300 text-sm">
        {label}
      </label>
      <select
        {...props}
        id={id}
        aria-invalid={hasErrors}
        aria-describedby={hasErrors ? errorId : undefined}
        className={`text-ink-100 min-h-11 rounded-[6px] border bg-black/45 px-3 py-2.5 text-base ${
          hasErrors ? 'border-danger-400' : 'focus:border-celeste-400 border-white/12'
        } ${className}`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-ink-800">
            {option.label}
          </option>
        ))}
      </select>
      {hasErrors ? (
        <p id={errorId} className="text-danger-400 text-sm">
          {errors.join(' ')}
        </p>
      ) : null}
    </div>
  );
};
