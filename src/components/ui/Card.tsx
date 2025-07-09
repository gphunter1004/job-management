import { HTMLAttributes, ReactNode, forwardRef } from 'react'
import clsx from 'clsx'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated' | 'glass'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
  children: ReactNode
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ 
    className, 
    variant = 'default', 
    padding = 'md',
    hover = false,
    children, 
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          // Base styles
          'rounded-lg transition-all duration-200',
          
          // Variant styles
          {
            // Default
            'bg-white shadow-card border border-gray-200': variant === 'default',
            
            // Outlined
            'bg-white border-2 border-gray-200': variant === 'outlined',
            
            // Elevated
            'bg-white shadow-soft border border-gray-100': variant === 'elevated',
            
            // Glass effect
            'glass border border-white/20': variant === 'glass',
          },
          
          // Padding variants
          {
            'p-0': padding === 'none',
            'p-3': padding === 'sm',
            'p-6': padding === 'md',
            'p-8': padding === 'lg',
          },
          
          // Hover effect
          {
            'hover:shadow-soft hover:-translate-y-1 cursor-pointer': hover,
          },
          
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

// Card sub-components
export const CardHeader = ({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={clsx('flex flex-col space-y-1.5 p-6', className)} {...props}>
    {children}
  </div>
)

export const CardTitle = ({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={clsx('text-lg font-semibold leading-none tracking-tight', className)} {...props}>
    {children}
  </h3>
)

export const CardDescription = ({ className, children, ...props }: HTMLAttributes<HTMLParagraphElement>) => (
  <p className={clsx('text-sm text-gray-500', className)} {...props}>
    {children}
  </p>
)

export const CardContent = ({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={clsx('p-6 pt-0', className)} {...props}>
    {children}
  </div>
)

export const CardFooter = ({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={clsx('flex items-center p-6 pt-0', className)} {...props}>
    {children}
  </div>
)

export default Card