"use client"

import { useState, useEffect, useMemo, useCallback } from 'react'

// Search and filter types
export interface SearchOptions {
  debounceMs?: number
  minLength?: number
  caseSensitive?: boolean
  fields?: string[]
  highlight?: boolean
}

export interface FilterOption {
  key: string
  label: string
  value: any
  count?: number
}

export interface SearchFilters {
  [key: string]: any
}

export interface SearchResult<T> {
  items: T[]
  total: number
  filtered: number
  searchTerm: string
  filters: SearchFilters
  highlightedItems?: T[]
}

// Search hook
export function useSearch<T>(
  items: T[],
  options: SearchOptions = {}
) {
  const {
    debounceMs = 300,
    minLength = 2,
    caseSensitive = false,
    fields = [],
    highlight = true
  } = options

  const [searchTerm, setSearchTerm] = React.useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = React.useState('')
  const [filters, setFilters] = React.useState<SearchFilters>({})
  const [sortBy, setSortBy] = React.useState<string>('')
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('asc')

  // Debounce search term
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [searchTerm, debounceMs])

  // Get searchable fields from items
  const searchableFields = React.useMemo(() => {
    if (fields.length > 0) return fields

    if (items.length > 0) {
      const firstItem = items[0]
      if (typeof firstItem === 'object' && firstItem !== null) {
        return Object.keys(firstItem)
      }
    }

    return []
  }, [items, fields])

  // Filter items based on search term and filters
  const filteredItems = React.useMemo(() => {
    let result = [...items]

    // Apply search term filter
    if (debouncedSearchTerm.length >= minLength) {
      const searchLower = caseSensitive ? debouncedSearchTerm : debouncedSearchTerm.toLowerCase()

      result = result.filter(item => {
        return searchableFields.some(field => {
          const value = getNestedValue(item, field)
          if (value === null || value === undefined) return false

          const stringValue = String(value)
          const compareValue = caseSensitive ? stringValue : stringValue.toLowerCase()

          return compareValue.includes(searchLower)
        })
      })
    }

    // Apply additional filters
    Object.entries(filters).forEach(([key, filterValue]) => {
      if (filterValue !== null && filterValue !== undefined && filterValue !== '') {
        result = result.filter(item => {
          const itemValue = getNestedValue(item, key)
          return matchesFilter(itemValue, filterValue)
        })
      }
    })

    return result
  }, [items, debouncedSearchTerm, filters, searchableFields, minLength, caseSensitive])

  // Sort filtered items
  const sortedItems = React.useMemo(() => {
    if (!sortBy) return filteredItems

    return [...filteredItems].sort((a, b) => {
      const aValue = getNestedValue(a, sortBy)
      const bValue = getNestedValue(b, sortBy)

      let comparison = 0

      if (aValue < bValue) comparison = -1
      else if (aValue > bValue) comparison = 1

      return sortOrder === 'desc' ? -comparison : comparison
    })
  }, [filteredItems, sortBy, sortOrder])

  // Create highlighted items for search results
  const highlightedItems = React.useMemo(() => {
    if (!highlight || debouncedSearchTerm.length < minLength) return sortedItems

    const searchLower = caseSensitive ? debouncedSearchTerm : debouncedSearchTerm.toLowerCase()

    return sortedItems.map(item => {
      const highlightedItem = { ...item }

      searchableFields.forEach(field => {
        const value = getNestedValue(item, field)
        if (typeof value === 'string') {
          const highlighted = highlightText(value, searchLower, caseSensitive)
          setNestedValue(highlightedItem, field, highlighted)
        }
      })

      return highlightedItem
    })
  }, [sortedItems, debouncedSearchTerm, searchableFields, highlight, minLength, caseSensitive])

  // Get filter options with counts
  const getFilterOptions = React.useCallback((field: string): FilterOption[] => {
    const options = new Map<string, number>()

    items.forEach(item => {
      const value = getNestedValue(item, field)
      if (value !== null && value !== undefined) {
        const key = String(value)
        options.set(key, (options.get(key) || 0) + 1)
      }
    })

    return Array.from(options.entries())
      .map(([value, count]) => ({
        key: field,
        label: formatFilterLabel(value),
        value,
        count
      }))
      .sort((a, b) => b.count - a.count)
  }, [items])

  // Search result object
  const result: SearchResult<T> = React.useMemo(() => ({
    items: sortedItems,
    total: items.length,
    filtered: sortedItems.length,
    searchTerm: debouncedSearchTerm,
    filters,
    highlightedItems: highlight ? highlightedItems : undefined
  }), [sortedItems, items.length, debouncedSearchTerm, filters, highlightedItems, highlight])

  // Actions
  const updateSearchTerm = React.useCallback((term: string) => {
    setSearchTerm(term)
  }, [])

  const updateFilter = React.useCallback((key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }, [])

  const clearFilter = React.useCallback((key: string) => {
    setFilters(prev => {
      const newFilters = { ...prev }
      delete newFilters[key]
      return newFilters
    })
  }, [])

  const clearAllFilters = React.useCallback(() => {
    setFilters({})
    setSearchTerm('')
  }, [])

  const updateSort = React.useCallback((field: string, order: 'asc' | 'desc' = 'asc') => {
    setSortBy(field)
    setSortOrder(order)
  }, [])

  return {
    // State
    searchTerm,
    debouncedSearchTerm,
    filters,
    sortBy,
    sortOrder,
    result,

    // Actions
    updateSearchTerm,
    updateFilter,
    clearFilter,
    clearAllFilters,
    updateSort,
    getFilterOptions
  }
}

// Utility functions
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

function setNestedValue(obj: any, path: string, value: any): void {
  const keys = path.split('.')
  const lastKey = keys.pop()!

  const target = keys.reduce((current, key) => {
    if (!(key in current)) current[key] = {}
    return current[key]
  }, obj)

  target[lastKey] = value
}

function matchesFilter(itemValue: any, filterValue: any): boolean {
  if (Array.isArray(filterValue)) {
    return filterValue.includes(itemValue)
  }

  if (typeof filterValue === 'object' && filterValue !== null) {
    if (filterValue.min !== undefined && itemValue < filterValue.min) return false
    if (filterValue.max !== undefined && itemValue > filterValue.max) return false
    if (filterValue.range && Array.isArray(filterValue.range)) {
      return itemValue >= filterValue.range[0] && itemValue <= filterValue.range[1]
    }
  }

  return itemValue === filterValue
}

function highlightText(text: string, searchTerm: string, caseSensitive: boolean): string {
  if (!searchTerm) return text

  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, caseSensitive ? 'g' : 'gi')
  return text.replace(regex, '<mark class="search-highlight">$1</mark>')
}

function formatFilterLabel(value: string): string {
  // Convert camelCase, snake_case, etc. to readable format
  return value
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
    .trim()
}

// Advanced search hook with API integration
export function useAPISearch<T>(
  apiSearchFunction: (params: any) => Promise<{ items: T[], total: number }>,
  options: SearchOptions = {}
) {
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const searchHook = useSearch<T>([], options)

  // Perform API search
  const performSearch = React.useCallback(async () => {
    if (searchHook.debouncedSearchTerm.length < (options.minLength || 2) && Object.keys(searchHook.filters).length === 0) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const searchParams = {
        search: searchHook.debouncedSearchTerm,
        filters: searchHook.filters,
        sortBy: searchHook.sortBy,
        sortOrder: searchHook.sortOrder,
        ...options
      }

      const response = await apiSearchFunction(searchParams)

      // Update the search hook with new items
      // Note: This is a simplified approach. In practice, you'd want to manage the items state separately
      searchHook.result.items = response.items
      searchHook.result.total = response.total
      searchHook.result.filtered = response.items.length

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
    } finally {
      setIsLoading(false)
    }
  }, [searchHook, options, apiSearchFunction])

  // Trigger search when search term or filters change
  React.useEffect(() => {
    performSearch()
  }, [performSearch])

  return {
    ...searchHook,
    isLoading,
    error,
    performSearch
  }
}

// Specialized hooks for different data types
export function useCredentialSearch(credentials: any[]) {
  return useSearch(credentials, {
    fields: ['type', 'issuerDid', 'subjectDid', 'status', 'description'],
    highlight: true,
    minLength: 2
  })
}

export function useConnectionSearch(connections: any[]) {
  return useSearch(connections, {
    fields: ['did', 'metadata.name', 'metadata.description', 'status', 'tags'],
    highlight: true,
    minLength: 2
  })
}

export function usePresentationSearch(presentations: any[]) {
  return useSearch(presentations, {
    fields: ['name', 'recipient', 'credentialsShared', 'status'],
    highlight: true,
    minLength: 2
  })
}

// Search and filter types
export interface SearchOptions {
  debounceMs?: number
  minLength?: number
  caseSensitive?: boolean
  fields?: string[]
  highlight?: boolean
}

export interface FilterOption {
  key: string
  label: string
  value: any
  count?: number
}

export interface SearchFilters {
  [key: string]: any
}

export interface SearchResult<T> {
  items: T[]
  total: number
  filtered: number
  searchTerm: string
  filters: SearchFilters
  highlightedItems?: T[]
}

// Search hook
export function useSearch<T>(
  items: T[],
  options: SearchOptions = {}
) {
  const {
    debounceMs = 300,
    minLength = 2,
    caseSensitive = false,
    fields = [],
    highlight = true
  } = options

  const [searchTerm, setSearchTerm] = React.useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = React.useState('')
  const [filters, setFilters] = React.useState<SearchFilters>({})
  const [sortBy, setSortBy] = React.useState<string>('')
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('asc')

  // Debounce search term
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [searchTerm, debounceMs])

  // Get searchable fields from items
  const searchableFields = React.useMemo(() => {
    if (fields.length > 0) return fields

    if (items.length > 0) {
      const firstItem = items[0]
      if (typeof firstItem === 'object' && firstItem !== null) {
        return Object.keys(firstItem)
      }
    }

    return []
  }, [items, fields])

  // Filter items based on search term and filters
  const filteredItems = React.useMemo(() => {
    let result = [...items]

    // Apply search term filter
    if (debouncedSearchTerm.length >= minLength) {
      const searchLower = caseSensitive ? debouncedSearchTerm : debouncedSearchTerm.toLowerCase()

      result = result.filter(item => {
        return searchableFields.some(field => {
          const value = getNestedValue(item, field)
          if (value === null || value === undefined) return false

          const stringValue = String(value)
          const compareValue = caseSensitive ? stringValue : stringValue.toLowerCase()

          return compareValue.includes(searchLower)
        })
      })
    }

    // Apply additional filters
    Object.entries(filters).forEach(([key, filterValue]) => {
      if (filterValue !== null && filterValue !== undefined && filterValue !== '') {
        result = result.filter(item => {
          const itemValue = getNestedValue(item, key)
          return matchesFilter(itemValue, filterValue)
        })
      }
    })

    return result
  }, [items, debouncedSearchTerm, filters, searchableFields, minLength, caseSensitive])

  // Sort filtered items
  const sortedItems = React.useMemo(() => {
    if (!sortBy) return filteredItems

    return [...filteredItems].sort((a, b) => {
      const aValue = getNestedValue(a, sortBy)
      const bValue = getNestedValue(b, sortBy)

      let comparison = 0

      if (aValue < bValue) comparison = -1
      else if (aValue > bValue) comparison = 1

      return sortOrder === 'desc' ? -comparison : comparison
    })
  }, [filteredItems, sortBy, sortOrder])

  // Create highlighted items for search results
  const highlightedItems = React.useMemo(() => {
    if (!highlight || debouncedSearchTerm.length < minLength) return sortedItems

    const searchLower = caseSensitive ? debouncedSearchTerm : debouncedSearchTerm.toLowerCase()

    return sortedItems.map(item => {
      const highlightedItem = { ...item }

      searchableFields.forEach(field => {
        const value = getNestedValue(item, field)
        if (typeof value === 'string') {
          const highlighted = highlightText(value, searchLower, caseSensitive)
          setNestedValue(highlightedItem, field, highlighted)
        }
      })

      return highlightedItem
    })
  }, [sortedItems, debouncedSearchTerm, searchableFields, highlight, minLength, caseSensitive])

  // Get filter options with counts
  const getFilterOptions = React.useCallback((field: string): FilterOption[] => {
    const options = new Map<string, number>()

    items.forEach(item => {
      const value = getNestedValue(item, field)
      if (value !== null && value !== undefined) {
        const key = String(value)
        options.set(key, (options.get(key) || 0) + 1)
      }
    })

    return Array.from(options.entries())
      .map(([value, count]) => ({
        key: field,
        label: formatFilterLabel(value),
        value,
        count
      }))
      .sort((a, b) => b.count - a.count)
  }, [items])

  // Search result object
  const result: SearchResult<T> = React.useMemo(() => ({
    items: sortedItems,
    total: items.length,
    filtered: sortedItems.length,
    searchTerm: debouncedSearchTerm,
    filters,
    highlightedItems: highlight ? highlightedItems : undefined
  }), [sortedItems, items.length, debouncedSearchTerm, filters, highlightedItems, highlight])

  // Actions
  const updateSearchTerm = React.useCallback((term: string) => {
    setSearchTerm(term)
  }, [])

  const updateFilter = React.useCallback((key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }, [])

  const clearFilter = React.useCallback((key: string) => {
    setFilters(prev => {
      const newFilters = { ...prev }
      delete newFilters[key]
      return newFilters
    })
  }, [])

  const clearAllFilters = React.useCallback(() => {
    setFilters({})
    setSearchTerm('')
  }, [])

  const updateSort = React.useCallback((field: string, order: 'asc' | 'desc' = 'asc') => {
    setSortBy(field)
    setSortOrder(order)
  }, [])

  return {
    // State
    searchTerm,
    debouncedSearchTerm,
    filters,
    sortBy,
    sortOrder,
    result,

    // Actions
    updateSearchTerm,
    updateFilter,
    clearFilter,
    clearAllFilters,
    updateSort,
    getFilterOptions
  }
}

// Utility functions
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

function setNestedValue(obj: any, path: string, value: any): void {
  const keys = path.split('.')
  const lastKey = keys.pop()!

  const target = keys.reduce((current, key) => {
    if (!(key in current)) current[key] = {}
    return current[key]
  }, obj)

  target[lastKey] = value
}

function matchesFilter(itemValue: any, filterValue: any): boolean {
  if (Array.isArray(filterValue)) {
    return filterValue.includes(itemValue)
  }

  if (typeof filterValue === 'object' && filterValue !== null) {
    if (filterValue.min !== undefined && itemValue < filterValue.min) return false
    if (filterValue.max !== undefined && itemValue > filterValue.max) return false
    if (filterValue.range && Array.isArray(filterValue.range)) {
      return itemValue >= filterValue.range[0] && itemValue <= filterValue.range[1]
    }
  }

  return itemValue === filterValue
}

function highlightText(text: string, searchTerm: string, caseSensitive: boolean): string {
  if (!searchTerm) return text

  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, caseSensitive ? 'g' : 'gi')
  return text.replace(regex, '<mark class="search-highlight">$1</mark>')
}

function formatFilterLabel(value: string): string {
  // Convert camelCase, snake_case, etc. to readable format
  return value
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
    .trim()
}

// Advanced search hook with API integration
export function useAPISearch<T>(
  apiSearchFunction: (params: any) => Promise<{ items: T[], total: number }>,
  options: SearchOptions = {}
) {
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const searchHook = useSearch<T>([], options)

  // Perform API search
  const performSearch = React.useCallback(async () => {
    if (searchHook.debouncedSearchTerm.length < (options.minLength || 2) && Object.keys(searchHook.filters).length === 0) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const searchParams = {
        search: searchHook.debouncedSearchTerm,
        filters: searchHook.filters,
        sortBy: searchHook.sortBy,
        sortOrder: searchHook.sortOrder,
        ...options
      }

      const response = await apiSearchFunction(searchParams)

      // Update the search hook with new items
      // Note: This is a simplified approach. In practice, you'd want to manage the items state separately
      searchHook.result.items = response.items
      searchHook.result.total = response.total
      searchHook.result.filtered = response.items.length

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
    } finally {
      setIsLoading(false)
    }
  }, [searchHook, options, apiSearchFunction])

  // Trigger search when search term or filters change
  React.useEffect(() => {
    performSearch()
  }, [performSearch])

  return {
    ...searchHook,
    isLoading,
    error,
    performSearch
  }
}

// Specialized hooks for different data types
export function useCredentialSearch(credentials: any[]) {
  return useSearch(credentials, {
    fields: ['type', 'issuerDid', 'subjectDid', 'status', 'description'],
    highlight: true,
    minLength: 2
  })
}

export function useConnectionSearch(connections: any[]) {
  return useSearch(connections, {
    fields: ['did', 'metadata.name', 'metadata.description', 'status', 'tags'],
    highlight: true,
    minLength: 2
  })
}

export function usePresentationSearch(presentations: any[]) {
  return useSearch(presentations, {
    fields: ['name', 'recipient', 'credentialsShared', 'status'],
    highlight: true,
    minLength: 2
  })
}
