"use client"

import React from 'react'
import {
  Search,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  Loader2
} from 'lucide-react'
import { useSearch } from '../hooks/use-search'
import type { FilterOption } from '../hooks/use-search'
 
interface SearchFilterBarProps<T> {
  data: T[]
  onSearchChange: (result: T[]) => void
  searchOptions?: {
    fields?: string[]
    minLength?: number
    placeholder?: string
    showAdvancedFilters?: boolean
  }
  filterConfig?: {
    [key: string]: {
      label: string
      type: 'select' | 'multiselect' | 'date' | 'range' | 'text'
      options?: FilterOption[]
      placeholder?: string
    }
  }
  sortOptions?: {
    [key: string]: string
  }
  className?: string
}

export default function SearchFilterBar<T extends Record<string, unknown>>({
  data,
  onSearchChange,
  searchOptions = {},
  filterConfig = {},
  sortOptions = {},
  className = ''
}: SearchFilterBarProps<T>) {
  const [showAdvancedFilters, setShowAdvancedFilters] = React.useState(false)
  const [dateRange, setDateRange] = React.useState({
    start: '',
    end: ''
  })

  const {
    searchTerm,
    filters,
    sortBy,
    sortOrder,
    result,
    updateSearchTerm,
    updateFilter,
    clearFilter,
    clearAllFilters,
    updateSort,

  } = useSearch(data, {
    fields: searchOptions.fields,
    minLength: searchOptions.minLength || 2,
    highlight: true
  })

  // Update parent component when search results change
  React.useEffect(() => {
    onSearchChange(result.items as T[])
  }, [result.items, onSearchChange])

  const handleDateRangeFilter = () => {
    if (dateRange.start || dateRange.end) {
      updateFilter('dateRange', {
        start: dateRange.start ? new Date(dateRange.start).toISOString() : null,
        end: dateRange.end ? new Date(dateRange.end).toISOString() : null
      })
    } else {
      clearFilter('dateRange')
    }
  }

  const getActiveFiltersCount = () => {
    let count = Object.keys(filters).length
    if (searchTerm.length >= (searchOptions.minLength || 2)) count++
    return count
  }

  const hasActiveFilters = getActiveFiltersCount() > 0

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {/* Main Search Bar */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => updateSearchTerm(e.target.value)}
              placeholder={searchOptions.placeholder || "Search..."}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={() => updateSearchTerm('')}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {searchOptions.showAdvancedFilters && (
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`flex items-center px-3 py-2 border rounded-lg transition-colors ${
                showAdvancedFilters
                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <span className="ml-2 bg-blue-600 text-white text-xs rounded-full px-2 py-0.5">
                  {getActiveFiltersCount()}
                </span>
              )}
              {showAdvancedFilters ? (
                <ChevronUp className="w-4 h-4 ml-2" />
              ) : (
                <ChevronDown className="w-4 h-4 ml-2" />
              )}
            </button>
          )}

          {Object.keys(sortOptions).length > 0 && (
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => updateSort(e.target.value, sortOrder)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sort by...</option>
                {Object.entries(sortOptions).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>

              {sortBy && (
                <button
                  onClick={() => updateSort(sortBy, sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
                >
                  {sortOrder === 'asc' ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
          )}

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="flex items-center px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
            >
              <X className="w-4 h-4 mr-2" />
              Clear All
            </button>
          )}
        </div>

        {/* Search Results Summary */}
        <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
          <div>
            {result.searchTerm && (
              <span>
                Found <strong>{result.filtered}</strong> of <strong>{result.total}</strong> items
                {result.searchTerm && ` for "${result.searchTerm}"`}
              </span>
            )}
            {!result.searchTerm && result.total > 0 && (
              <span>Showing <strong>{result.filtered}</strong> of <strong>{result.total}</strong> items</span>
            )}
          </div>

          {result.searchTerm && (
            <div className="flex items-center text-xs text-gray-500">
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              Searching...
            </div>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="p-4 border-b bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Date Range Filter */}
            {filterConfig.dateRange && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {filterConfig.dateRange.label}
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Start date"
                  />
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="End date"
                  />
                </div>
                <button
                  onClick={handleDateRangeFilter}
                  className="w-full px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  Apply Date Filter
                </button>
              </div>
            )}

            {/* Other Filters */}
            {Object.entries(filterConfig).map(([key, config]) => {
              if (key === 'dateRange') return null

              return (
                <div key={key} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {config.label}
                  </label>

                  {config.type === 'select' && (
                    <select
                      value={filters[key] || ''}
                      onChange={(e) => updateFilter(key, e.target.value || null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">{config.placeholder || 'Select...'}</option>
                      {config.options?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label} {option.count !== undefined && `(${option.count})`}
                        </option>
                      ))}
                    </select>
                  )}

                  {config.type === 'multiselect' && (
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {config.options?.map((option) => (
                        <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={Array.isArray(filters[key]) && filters[key].includes(option.value)}
                            onChange={(e) => {
                              const currentValues = Array.isArray(filters[key]) ? filters[key] : []
                              const newValues = e.target.checked
                                ? [...currentValues, option.value]
                                : currentValues.filter(v => v !== option.value)
                              updateFilter(key, newValues.length > 0 ? newValues : null)
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm">
                            {option.label} {option.count !== undefined && `(${option.count})`}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}

                  {config.type === 'text' && (
                    <input
                      type="text"
                      value={filters[key] || ''}
                      onChange={(e) => updateFilter(key, e.target.value || null)}
                      placeholder={config.placeholder}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  )}

                  {filters[key] && (
                    <button
                      onClick={() => clearFilter(key)}
                      className="text-xs text-red-600 hover:text-red-800"
                    >
                      Clear filter
                    </button>
                  )}
                </div>
              )
            })}
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex flex-wrap gap-2">
                {searchTerm && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                    Search: &quot;{searchTerm}&quot;
                    <button
                      onClick={() => updateSearchTerm('')}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {Object.entries(filters).map(([key, value]) => {
                  if (!value) return null

                  const config = filterConfig[key]
                  const label = config?.label || key

                  return (
                    <span key={key} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800">
                      {label}: {formatFilterValue(value)}
                      <button
                        onClick={() => clearFilter(key)}
                        className="ml-2 text-gray-600 hover:text-gray-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Utility function to format filter values for display
function formatFilterValue(value: unknown): string {
  if (Array.isArray(value)) {
    return value.join(', ')
  }

  if (typeof value === 'object' && value !== null) {
    const obj = value as Record<string, unknown>
    if ((obj as any).start && (obj as any).end) {
      return `${(obj as any).start} to ${(obj as any).end}`
    }
    if ((obj as any).min !== undefined || (obj as any).max !== undefined) {
      const min = (obj as any).min ?? '∞'
      const max = (obj as any).max ?? '∞'
      return `${min} - ${max}`
    }
  }

  return String(value)
}

// Specialized filter components
export function DateRangeFilter({
  startDate,
  endDate,
  onChange,
  label = "Date Range"
}: {
  startDate?: string
  endDate?: string
  onChange: (range: { start?: string, end?: string }) => void
  label?: string
}) {
  const [localRange, setLocalRange] = React.useState({
    start: startDate || '',
    end: endDate || ''
  })

  React.useEffect(() => {
    setLocalRange({
      start: startDate || '',
      end: endDate || ''
    })
  }, [startDate, endDate])

  const handleApply = () => {
    onChange({
      start: localRange.start || undefined,
      end: localRange.end || undefined
    })
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="flex gap-2">
        <input
          type="date"
          value={localRange.start}
          onChange={(e) => setLocalRange(prev => ({ ...prev, start: e.target.value }))}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <input
          type="date"
          value={localRange.end}
          onChange={(e) => setLocalRange(prev => ({ ...prev, end: e.target.value }))}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <button
        onClick={handleApply}
        className="w-full px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
      >
        Apply Filter
      </button>
    </div>
  )
}

export function StatusFilter({
  value,
  options,
  onChange,
  label = "Status"
}: {
  value?: string
  options: { value: string, label: string, color?: string }[]
  onChange: (value: string | null) => void
  label?: string
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value || null)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="">All Status</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export function TypeFilter({
  value,
  options,
  onChange,
  label = "Type"
}: {
  value?: string[]
  options: { value: string, label: string, icon?: string }[]
  onChange: (value: string[] | null) => void
  label?: string
}) {
  const handleToggle = (optionValue: string) => {
    const currentValues = value || []
    const newValues = currentValues.includes(optionValue)
      ? currentValues.filter(v => v !== optionValue)
      : [...currentValues, optionValue]

    onChange(newValues.length > 0 ? newValues : null)
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {options.map((option) => (
          <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={value?.includes(option.value) || false}
              onChange={() => handleToggle(option.value)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="flex items-center text-sm">
              {option.icon && <span className="mr-1">{option.icon}</span>}
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}
