import { HTMLAttributes } from 'react'
import { Loader2 } from 'lucide-react'
import clsx from 'clsx'

export interface LoadingSpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'primary' | 'secondary' | 'white'
  text?: string
}

const LoadingSpinner = ({ 
  size = 'md', 
  variant = 'primary', 
  text,
  className,
  ...props 
}: LoadingSpinnerProps) => {
  return (
    <div 
      className={clsx('flex items-center justify-center', className)}
      {...props}
    >
      <div className="flex flex-col items-center space-y-2">
        <Loader2 
          className={clsx(
            'animate-spin',
            // Size variants
            {
              'w-4 h-4': size === 'xs',
              'w-5 h-5': size === 'sm',
              'w-8 h-8': size === 'md',
              'w-12 h-12': size === 'lg',
              'w-16 h-16': size === 'xl',
            },
            // Color variants
            {
              'text-primary-600': variant === 'primary',
              'text-gray-600': variant === 'secondary',
              'text-white': variant === 'white',
            }
          )}
        />
        {text && (
          <p className={clsx(
            'text-sm font-medium',
            {
              'text-primary-600': variant === 'primary',
              'text-gray-600': variant === 'secondary',
              'text-white': variant === 'white',
            }
          )}>
            {text}
          </p>
        )}
      </div>
    </div>
  )
}

// Skeleton loader for content placeholders
export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
  lines?: number
}

export const Skeleton = ({ 
  variant = 'rectangular',
  width,
  height,
  lines = 1,
  className,
  ...props 
}: SkeletonProps) => {
  if (variant === 'text' && lines > 1) {
    return (
      <div className={clsx('space-y-2', className)} {...props}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className="skeleton h-4 rounded"
            style={{ 
              width: index === lines - 1 ? '60%' : '100%'
            }}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className={clsx(
        'skeleton',
        {
          'rounded-full': variant === 'circular',
          'rounded': variant === 'rectangular',
          'h-4 rounded': variant === 'text',
        },
        className
      )}
      style={{ width, height }}
      {...props}
    />
  )
}

// Full page loading component
export const PageLoading = ({ text = 'Loading...' }: { text?: string }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <LoadingSpinner size="lg" text={text} />
  </div>
)

// Overlay loading component
export const OverlayLoading = ({ text = 'Loading...' }: { text?: string }) => (
  <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
    <LoadingSpinner size="lg" text={text} />
  </div>
)

export default LoadingSpinner