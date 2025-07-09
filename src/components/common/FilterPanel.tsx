import { HTMLAttributes } from 'react'
import { X } from 'lucide-react'
import clsx from 'clsx'

import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'

interface FilterPanelProps extends HTMLAttributes<HTMLDivElement> {
  filters: {
    status: string
    batteryLevel: string
    hasErrors: boolean
  }
  onFiltersChange: (filters: any) => void
  onClear?: () => void
}

const FilterPanel = ({ 
  filters, 
  onFiltersChange, 
  onClear,
  className,
  ...props 
}: FilterPanelProps) => {
  const handleFilterChange = (key: string, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const handleClearFilters = () => {
    const clearedFilters = {
      status: 'all',
      batteryLevel: 'all',
      hasErrors: false
    }
    onFiltersChange(clearedFilters)
    onClear?.()
  }

  const hasActiveFilters = 
    filters.status !== 'all' || 
    filters.batteryLevel !== 'all' || 
    filters.hasErrors

  return (
    <div className={clsx('bg-gray-50 rounded-lg p-4', className)} {...props}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-900">Filters</h3>
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleClearFilters}
            leftIcon={<X className="w-4 h-4" />}
          >
            Clear
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <Select
            value={filters.status}
            onChange={(value) => handleFilterChange('status', value)}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'online', label: 'Online' },
              { value: 'offline', label: 'Offline' },
            ]}
          />
        </div>

        {/* Battery Level Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Battery Level
          </label>
          <Select
            value={filters.batteryLevel}
            onChange={(value) => handleFilterChange('batteryLevel', value)}
            options={[
              { value: 'all', label: 'All Levels' },
              { value: 'high', label: 'High (80%+)' },
              { value: 'medium', label: 'Medium (20-80%)' },
              { value: 'low', label: 'Low (<20%)' },
            ]}
          />
        </div>

        {/* Has Errors Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Error Status
          </label>
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.hasErrors}
                onChange={(e) => handleFilterChange('hasErrors', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Has Errors</span>
            </label>
          </div>
        </div>
      </div>

      {/* Active filters summary */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>Active filters:</span>
            {filters.status !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                Status: {filters.status}
              </span>
            )}
            {filters.batteryLevel !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                Battery: {filters.batteryLevel}
              </span>
            )}
            {filters.hasErrors && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-error-100 text-error-800">
                Has Errors
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default FilterPanel