import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import clsx from 'clsx'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline' | 'ghost'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  fullWidth?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant = 'primary',
    size = 'md',
    loading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    disabled,
    children,
    ...props
  }, ref) => {
    const isDisabled = disabled || loading

    return (
      <button
        className={clsx(
          // Base styles
          'inline-flex items-center justify-center font-medium rounded-md transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          
          // Size variants
          {
            'px-2 py-1 text-xs': size === 'xs',
            'px-3 py-1.5 text-sm': size === 'sm',
            'px-4 py-2 text-sm': size === 'md',
            'px-6 py-3 text-base': size === 'lg',
            'px-8 py-4 text-lg': size === 'xl',
          },
          
          // Color variants
          {
            // Primary
            'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500': 
              variant === 'primary' && !isDisabled,
            
            // Secondary
            'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500': 
              variant === 'secondary' && !isDisabled,
            
            // Success
            'bg-success-600 text-white hover:bg-success-700 focus:ring-success-500': 
              variant === 'success' && !isDisabled,
            
            // Warning
            'bg-warning-600 text-white hover:bg-warning-700 focus:ring-warning-500': 
              variant === 'warning' && !isDisabled,
            
            // Error
            'bg-error-600 text-white hover:bg-error-700 focus:ring-error-500': 
              variant === 'error' && !isDisabled,
            
            // Outline
            'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-primary-500': 
              variant === 'outline' && !isDisabled,
            
            // Ghost
            'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-primary-500': 
              variant === 'ghost' && !isDisabled,
          },
          
          // Full width
          { 'w-full': fullWidth },
          
          className
        )}
        disabled={isDisabled}
        ref={ref}
        {...props}
      >
        {/* Loading spinner */}
        {loading && (
          <Loader2 className={clsx(
            'animate-spin',
            {
              'w-3 h-3': size === 'xs',
              'w-4 h-4': size === 'sm' || size === 'md',
              'w-5 h-5': size === 'lg',
              'w-6 h-6': size === 'xl',
            },
            children ? 'mr-2' : ''
          )} />
        )}
        
        {/* Left icon */}
        {leftIcon && !loading && (
          <span className={clsx(
            {
              'w-3 h-3': size === 'xs',
              'w-4 h-4': size === 'sm' || size === 'md',
              'w-5 h-5': size === 'lg',
              'w-6 h-6': size === 'xl',
            },
            children ? 'mr-2' : ''
          )}>
            {leftIcon}
          </span>
        )}
        
        {/* Button text */}
        {children}
        
        {/* Right icon */}
        {rightIcon && !loading && (
          <span className={clsx(
            {
              'w-3 h-3': size === 'xs',
              'w-4 h-4': size === 'sm' || size === 'md',
              'w-5 h-5': size === 'lg',
              'w-6 h-6': size === 'xl',
            },
            children ? 'ml-2' : ''
          )}>
            {rightIcon}
          </span>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button