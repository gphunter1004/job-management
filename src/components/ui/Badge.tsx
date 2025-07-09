import { HTMLAttributes, ReactNode } from 'react'
import clsx from 'clsx'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

const Badge = ({ 
  className, 
  variant = 'default', 
  size = 'md',
  children, 
  ...props 
}: BadgeProps) => {
  return (
    <span
      className={clsx(
        // Base styles
        'inline-flex items-center font-medium rounded-full',
        
        // Size variants
        {
          'px-2 py-0.5 text-xs': size === 'sm',
          'px-2.5 py-0.5 text-sm': size === 'md',
          'px-3 py-1 text-base': size === 'lg',
        },
        
        // Color variants
        {
          // Default
          'bg-gray-100 text-gray-800': variant === 'default',
          
          // Primary
          'bg-primary-100 text-primary-800': variant === 'primary',
          
          // Secondary
          'bg-gray-100 text-gray-800': variant === 'secondary',
          
          // Success
          'bg-success-100 text-success-800': variant === 'success',
          
          // Warning
          'bg-warning-100 text-warning-800': variant === 'warning',
          
          // Error
          'bg-error-100 text-error-800': variant === 'error',
          
          // Info
          'bg-blue-100 text-blue-800': variant === 'info',
        },
        
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

export default Badge