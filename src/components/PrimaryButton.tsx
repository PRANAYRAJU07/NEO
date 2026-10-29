import React from 'react';
import { Loader2 } from 'lucide-react';

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'healthy';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg sm:rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#07090e] active:scale-[0.99] select-none';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs sm:text-sm gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3.5 text-base gap-2.5',
  };

  const variantStyles = {
    primary: 'bg-white hover:bg-slate-200 text-slate-950 border-white/90 focus:ring-sky-400 font-semibold shadow-sm',
    secondary: 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 hover:text-white border-white/10 focus:ring-slate-400',
    danger: 'bg-red-600 hover:bg-red-500 text-white border-red-500/40 focus:ring-red-400 font-semibold',
    outline: 'bg-transparent hover:bg-white/[0.05] text-slate-300 hover:text-white border-white/20 hover:border-white/40 focus:ring-sky-400',
    healthy: 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500/40 focus:ring-emerald-400 font-semibold',
  };

  const disabledStyles = (disabled || isLoading) ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer';

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${disabledStyles} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
      ) : (
        leftIcon
      )}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
};
