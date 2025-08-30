const fs = require('fs');
const content = fs.readFileSync('tests/components/search-filter-bar.test.tsx', 'utf8');

// Replace the mock at the bottom of the file
const updated = content.replace(
  /jest\.mock\('..\/..\/src\/hooks\/use-search', \(\) => \(\{\s*useSearch: jest\.fn\(\(\) => \(\{\s*searchTerm: '',\s*filters: \{\},\s*sortBy: '',\s*sortOrder: 'asc',\s*result: \{\s*items: \[\],\s*total: 0,\s*filtered: 0,\s*searchTerm: '',\s*filters: \{\},\s*highlightedItems: \[\],\s*query: '',\s*filteredItems: \[\]\s*\},\s*updateSearchTerm: jest\.fn\(\),\s*updateFilter: jest\.fn\(\),\s*clearFilter: jest\.fn\(\),\s*clearAllFilters: jest\.fn\(\),\s*updateSort: jest\.fn\(\),\s*getFilterOptions: jest\.fn\(\(\) => \[\]\)\s*\}\)\)\s*\}\)\)\);/,
  \jest.mock('../../src/hooks/use-search', () => {
  let mockSearchTerm = '';
  let mockFilters = {};
  let mockSortBy = '';
  let mockSortOrder = 'asc';

  const useSearch = jest.fn((data = []) => {
    const mockData = [
      { id: '1', name: 'Alice Johnson', type: 'individual' },
      { id: '2', name: 'Bob Smith', type: 'organization' },
      { id: '3', name: 'Charlie Brown', type: 'individual' },
    ];
    
    const currentData = data.length > 0 ? data : mockData;
    
    // Apply search filtering
    let filteredItems = [...currentData];
    if (mockSearchTerm && mockSearchTerm.length >= 2) {
      const searchLower = mockSearchTerm.toLowerCase();
      filteredItems = currentData.filter(item => 
        item.name.toLowerCase().includes(searchLower) ||
        item.type.toLowerCase().includes(searchLower)
      );
    }
    
    const updateSearchTerm = jest.fn((term) => {
      mockSearchTerm = term;
    });
    
    const updateFilter = jest.fn((key, value) => {
      mockFilters = { ...mockFilters, [key]: value };
    });
    
    const clearFilter = jest.fn((key) => {
      const newFilters = { ...mockFilters };
      delete newFilters[key];
      mockFilters = newFilters;
    });
    
    const clearAllFilters = jest.fn(() => {
      mockSearchTerm = '';
      mockFilters = {};
    });
    
    const updateSort = jest.fn((field, order = 'asc') => {
      mockSortBy = field;
      mockSortOrder = order;
    });
    
    const getFilterOptions = jest.fn(() => []);
    
    return {
      searchTerm: mockSearchTerm,
      filters: mockFilters,
      sortBy: mockSortBy,
      sortOrder: mockSortOrder,
      result: {
        items: filteredItems,
        total: currentData.length,
        filtered: filteredItems.length,
        searchTerm: mockSearchTerm,
        filters: mockFilters,
        highlightedItems: [],
        query: mockSearchTerm,
        filteredItems: filteredItems
      },
      updateSearchTerm,
      updateFilter,
      clearFilter,
      clearAllFilters,
      updateSort,
      getFilterOptions
    };
  });
  
  return { useSearch };
});;\
);

fs.writeFileSync('tests/components/search-filter-bar.test.tsx', updated);
console.log('Updated SearchFilterBar test mock');
