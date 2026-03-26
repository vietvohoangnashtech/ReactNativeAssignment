import {renderHook, waitFor} from '@testing-library/react-native';
import {useCategories} from './useCategories';
import {categoryService} from '../services/categoryService';
import type {Category} from '../types/category.types';

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('../services/categoryService');
const mockedCategoryService = categoryService as jest.Mocked<typeof categoryService>;

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useCategories hook', () => {
  beforeEach(() => {
    mockedCategoryService.getCategories.mockReset();
  });

  it('should initialise with the "All" category and loading=false', () => {
    mockedCategoryService.getCategories.mockResolvedValue([]);
    const {result} = renderHook(() => useCategories());
    expect(result.current.categories).toEqual([{id: 0, name: 'All'}]);
  });

  it('should prepend the "All" category to the API result', async () => {
    const apiCategories: Category[] = [
      {id: 1, name: 'Electronics'},
      {id: 2, name: 'Clothing'},
    ];
    mockedCategoryService.getCategories.mockResolvedValue(apiCategories);
    const {result} = renderHook(() => useCategories());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.categories).toHaveLength(3);
    expect(result.current.categories[0]).toEqual({id: 0, name: 'All'});
    expect(result.current.categories[1].name).toBe('Electronics');
  });

  it('should set loading=false once fetch completes', async () => {
    mockedCategoryService.getCategories.mockResolvedValue([]);
    const {result} = renderHook(() => useCategories());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('should keep only the "All" fallback when API errors', async () => {
    mockedCategoryService.getCategories.mockRejectedValue(new Error('Network'));
    const {result} = renderHook(() => useCategories());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.categories).toEqual([{id: 0, name: 'All'}]);
  });
});
