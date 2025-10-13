// Reusable Button component with CTA styling

import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'cta' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  ariaLabel?: string;
  fullWidth?: boolean;
  style?: React.CSSProperties;
}

export default function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  type = 'button',
  ariaLabel,
  fullWidth = false,
  style,
}: ButtonProps) {
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm rounded-lg',
    md: 'px-6 py-3 rounded-xl',
    lg: 'px-8 py-4 text-lg rounded-xl',
  };

  const baseStyles = `
    font-semibold 
    transition-all duration-300 ease-in-out
    disabled:opacity-50 disabled:cursor-not-allowed
    focus:outline-none focus-visible:ring-4 focus-visible:ring-cta/50
    active:scale-95
    inline-flex items-center justify-center gap-2
    ${sizeStyles[size]}
    ${fullWidth ? 'w-full' : ''}
  `;
  
  const variantStyles = {
    primary: `
      bg-primary text-white hover:bg-primary/90 
      shadow-md hover:shadow-lg hover:-translate-y-0.5
      disabled:hover:translate-y-0 disabled:hover:shadow-md
    `,
    secondary: `
      bg-gray-200 text-gray-800 hover:bg-gray-300 
      shadow-sm hover:shadow-md hover:-translate-y-0.5
      disabled:hover:translate-y-0 disabled:hover:shadow-sm
    `,
    cta: `
      bg-cta text-primary hover:bg-cta/90 
      shadow-lg hover:shadow-xl hover:-translate-y-0.5
      disabled:hover:translate-y-0 disabled:hover:shadow-lg
      font-bold
    `,
    outline: `
      bg-transparent border-2 border-gray-200 text-gray-700 
      hover:border-primary hover:text-primary hover:bg-primary/5
      shadow-sm hover:shadow-md
    `,
  };

  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      aria-label={ariaLabel}
      aria-busy={loading}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      style={style}
    >
      {loading && <LoadingSpinner size="sm" />}
      <span className={loading ? 'opacity-70' : ''}>{children}</span>
    </button>
  );
}

