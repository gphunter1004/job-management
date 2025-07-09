import { useState, useEffect, useRef } from 'react'; // Import useRef
import { Search, X } from 'lucide-react';
import clsx from 'clsx';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  disabled?: boolean;
}

const SearchBar = ({
  value,
  onChange,
  placeholder = 'Search...',
  debounceMs = 300,
  className,
  onFocus,
  onBlur,
  disabled = false,
}: SearchBarProps) => {
  const [internalValue, setInternalValue] = useState(value);
  const debouncedValue = useDebounce(internalValue, debounceMs);

  // Use a ref to track if it's the initial mount to prevent calling onChange on mount
  const isInitialMount = useRef(true);

  useEffect(() => {
    // Prevent calling onChange on the initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    // Only call onChange if the debounced value is different from the current external value (Redux state)
    // This is crucial to prevent the infinite loop when Redux updates the external value
    // back to the same debounced value that triggered the Redux update.
    if (debouncedValue !== value) {
      onChange(debouncedValue);
    }
  }, [debouncedValue, onChange, value]); // Added 'value' to dependencies to ensure comparison is accurate

  useEffect(() => {
    // Update internalValue only if the external value prop truly changes
    // and is different from the current internalValue, to prevent unnecessary re-renders.
    if (value !== internalValue) {
      setInternalValue(value);
    }
  }, [value, internalValue]); // Added 'internalValue' to dependencies

  const handleClear = () => {
    setInternalValue('');
    onChange(''); // This should also update the external state immediately
  };

  return (
    <div className={clsx('relative', className)}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      
      <input
        type="text"
        value={internalValue}
        onChange={(e) => setInternalValue(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        disabled={disabled}
        className={clsx(
          'block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md',
          'placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500',
          'sm:text-sm transition-colors duration-200',
          {
            'bg-gray-50 cursor-not-allowed': disabled,
            'bg-white': !disabled,
          }
        )}
        placeholder={placeholder}
      />
      
      {internalValue && !disabled && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          <button
            type="button"
            onClick={handleClear}
            className="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors duration-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchBar;