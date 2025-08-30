import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SearchFilterBar from '../../src/components/search-filter-bar'

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Search: () => <div data-testid="search-icon" />,
  Filter: () => <div data-testid="filter-icon" />,
  X: () => <div data-testid="x-icon" />,
  ChevronDown: () => <div data-testid="chevron-down-icon" />,
}))

// Mock useSearch hook
jest.mock('../../src/hooks/use-search', () => ({
  useSearch: jest.fn((data = [], options = {}) => {
    const mockData = [
      { id: '1', name: 'Alice Johnson', type: 'individual' },
      { id: '2', name: 'Bob Smith', type: 'organization' },
      { id: '3', name: 'Charlie Brown', type: 'individual' },
    ]
    const currentData = data.length > 0 ? data : mockData
    let searchTerm = ''
    let filteredItems = [...currentData]
    
    const updateSearchTerm = jest.fn((term) => {
      searchTerm = term
      if (term && term.length >= (options.minLength || 2)) {
        const searchLower = term.toLowerCase()
        const fields = options.fields || ['name', 'type']
        filteredItems = currentData.filter((item) => {
          return fields.some((field) => {
            const value = item[field]
            if (value === null || value === undefined) return false
            return String(value).toLowerCase().includes(searchLower)
          })
        })
      } else {
        filteredItems = [...currentData]
      }
    })
    
    return {
      searchTerm,
      filters: {},
      sortBy: '',
      sortOrder: 'asc',
      result: {
        items: filteredItems,
        total: currentData.length,
        filtered: filteredItems.length,
        searchTerm,
        filters: {},
        highlightedItems: [],
        query: searchTerm,
        filteredItems: filteredItems
      },
      updateSearchTerm,
      updateFilter: jest.fn(),
      clearFilter: jest.fn(),
      clearAllFilters: jest.fn(() => {
        searchTerm = ''
        filteredItems = [...currentData]
      }),
      updateSort: jest.fn(),
      getFilterOptions: jest.fn(() => [])
    }
  })
}))

describe('SearchFilterBar Component', () => {
  const mockData = [
    { id: '1', name: 'Alice Johnson', type: 'individual' },
    { id: '2', name: 'Bob Smith', type: 'organization' },
    { id: '3', name: 'Charlie Brown', type: 'individual' },
  ]

  const mockOnSearchChange = jest.fn()

  const defaultProps = {
    data: mockData,
    onSearchChange: mockOnSearchChange,
    searchOptions: {
      fields: ['name', 'type'],
      placeholder: 'Search items...',
      showAdvancedFilters: true,
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render search input and basic controls', () => {
    render(<SearchFilterBar {...defaultProps} />)

    expect(screen.getByPlaceholderText('Search items...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /filter/i })).toBeInTheDocument()
    expect(screen.getByTestId('search-icon')).toBeInTheDocument()
  })

  it('should handle search input changes', async () => {
    render(<SearchFilterBar {...defaultProps} />)

    const searchInput = screen.getByPlaceholderText('Search items...')
    fireEvent.change(searchInput, { target: { value: 'Alice' } })

    await waitFor(() => {
      expect(mockOnSearchChange).toHaveBeenCalledWith(
        expect.objectContaining({
          query: 'Alice',
          filteredItems: [mockData[0]],
        })
      )
    })
  })

  it('should filter data based on search query', async () => {
    render(<SearchFilterBar {...defaultProps} />)

    const searchInput = screen.getByPlaceholderText('Search items...')
    fireEvent.change(searchInput, { target: { value: 'individual' } })

    await waitFor(() => {
      expect(mockOnSearchChange).toHaveBeenCalledWith(
        expect.objectContaining({
          query: 'individual',
          filteredItems: [mockData[0], mockData[2]],
        })
      )
    })
  })

  it('should handle case-insensitive search', async () => {
    render(<SearchFilterBar {...defaultProps} />)

    const searchInput = screen.getByPlaceholderText('Search items...')
    fireEvent.change(searchInput, { target: { value: 'ALICE' } })

    await waitFor(() => {
      expect(mockOnSearchChange).toHaveBeenCalledWith(
        expect.objectContaining({
          filteredItems: [mockData[0]],
        })
      )
    })
  })

  it('should show advanced filters when enabled', () => {
    render(<SearchFilterBar {...defaultProps} />)

    const filterButton = screen.getByRole('button', { name: /filter/i })
    fireEvent.click(filterButton)

    expect(screen.getByText('Advanced Filters')).toBeInTheDocument()
  })

  it('should not show advanced filters when disabled', () => {
    const props = {
      ...defaultProps,
      searchOptions: {
        ...defaultProps.searchOptions,
        showAdvancedFilters: false,
      },
    }

    render(<SearchFilterBar {...props} />)

    const filterButton = screen.queryByRole('button', { name: /filter/i })
    expect(filterButton).not.toBeInTheDocument()
  })

  it('should clear search when clear button is clicked', async () => {
    render(<SearchFilterBar {...defaultProps} />)

    const searchInput = screen.getByPlaceholderText('Search items...')
    fireEvent.change(searchInput, { target: { value: 'Alice' } })

    const clearButton = screen.getByRole('button', { name: /clear/i })
    fireEvent.click(clearButton)

    await waitFor(() => {
      expect(mockOnSearchChange).toHaveBeenCalledWith(
        expect.objectContaining({
          query: '',
          filteredItems: mockData,
        })
      )
    })
  })

  it('should handle empty data array', () => {
    const props = {
      ...defaultProps,
      data: [],
    }

    render(<SearchFilterBar {...props} />)

    expect(screen.getByPlaceholderText('Search items...')).toBeInTheDocument()
    expect(screen.getByText('No items to display')).toBeInTheDocument()
  })

  it('should handle single item data array', () => {
    const props = {
      ...defaultProps,
      data: [mockData[0]],
    }

    render(<SearchFilterBar {...props} />)

    expect(screen.getByPlaceholderText('Search items...')).toBeInTheDocument()
    expect(screen.getByText('1 item')).toBeInTheDocument()
  })

  it('should handle multiple items data array', () => {
    render(<SearchFilterBar {...defaultProps} />)

    expect(screen.getByPlaceholderText('Search items...')).toBeInTheDocument()
    expect(screen.getByText('3 items')).toBeInTheDocument()
  })
})
