import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-grass-500 text-pitch-950 hover:bg-grass-400 font-semibold',
  secondary: 'bg-pitch-800 text-pitch-50 hover:bg-pitch-700 border border-white/10',
  ghost: 'text-pitch-200 hover:bg-white/8',
  danger: 'bg-danger-600 text-white hover:bg-danger-400 font-semibold',
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
    className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-[--radius-control] px-4 py-2.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-55 ${VARIANTS[variant]} ${className}`}
  >
    {isLoading ? <span className="sr-only">Procesando</span> : null}
    {children}
  </button>
);
