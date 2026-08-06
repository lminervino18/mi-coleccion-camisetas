import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-brand-500 hover:bg-brand-600 text-white font-semibold',
  secondary: 'bg-white/10 hover:bg-white/16 text-ink-100 border border-white/12',
  ghost: 'text-ink-300 hover:bg-white/10',
  danger: 'bg-danger-600 hover:bg-danger-400 text-white font-semibold',
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  isLoading?: boolean;
};

/** Minimum height of 44px keeps every control within the touch target guidance. */
export const Button = ({
  variant = 'primary',
  isLoading = false,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) => (
  <button
    {...props}
    disabled={disabled === true || isLoading}
    aria-busy={isLoading}
    className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-[6px] px-4 py-2.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-55 ${VARIANTS[variant]} ${className}`}
  >
    {isLoading ? <span className="sr-only">Procesando</span> : null}
    {children}
  </button>
);
