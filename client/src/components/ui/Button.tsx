import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

// ============================================================
// Button — primary interaction primitive
// ============================================================

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-lg)] font-medium transition-all duration-[var(--duration-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-[var(--opacity-disabled)]',
  {
    variants: {
      variant: {
        primary: 'bg-primary-600 text-text-inverse shadow-sm hover:bg-primary-700 active:bg-primary-800',
        secondary: 'bg-secondary-500 text-text-inverse shadow-sm hover:bg-secondary-600 active:bg-secondary-700',
        outline: 'border border-border bg-transparent text-text-primary hover:bg-muted active:bg-primary-50',
        ghost: 'text-text-primary hover:bg-muted active:bg-primary-50',
        danger: 'bg-danger-600 text-text-inverse shadow-sm hover:bg-danger-700 active:bg-danger-800',
        success: 'bg-success-600 text-text-inverse shadow-sm hover:bg-success-700 active:bg-success-700',
        link: 'text-text-link underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled ?? isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  },
);

Button.displayName = 'Button';

export { buttonVariants };
