import { SelectHTMLAttributes, forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'
import clsx from 'clsx'

export interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  options: SelectOption[]
  placeholder?: string
  error?: boolean
  onChange?: (value: string) => void
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ 
    className, 
    options, 
    placeholder,
    error = false,
    onChange,
    disabled,
    ...props 
  }, ref) => {
    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      onChange?.(event.target.value)
    }

    return (
      <div className="relative">
        <select
          ref={ref}
          onChange={handleChange}
          disabled={disabled}
          className={clsx(
            // Base styles
            'block w-full pl-3 pr-10 py-2 text-sm border rounded-md',
            'focus:outline-none focus:ring-1 transition-colors duration-200',
            'appearance-none bg-white',
            
            // State styles
            {
              'border-gray-300 focus:ring-primary-500 focus:border-primary-500': !error && !disabled,
              'border-error-300 focus:ring-error-500 focus:border-error-500': error && !disabled,
              'bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed': disabled,
            },
            
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Dropdown arrow */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <ChevronDown className={clsx(
            'h-4 w-4',
            {
              'text-gray-400': !disabled,
              'text-gray-300': disabled,
            }
          )} />
        </div>
      </div>
    )
  }
)

Select.displayName = 'Select'

export default Select