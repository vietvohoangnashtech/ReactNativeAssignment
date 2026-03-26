import apiClient from '../../../services/api/client';
import {categoryService} from './categoryService';
import type {Category} from '../types/category.types';

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('../../../services/api/client');
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockCategories: Category[] = [
  {id: 1, name: 'Electronics'},
  {id: 2, name: 'Clothing'},
  {id: 3, name: 'Books'},
];

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('categoryService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCategories', () => {
    it('should return categories from API', async () => {
      mockedApiClient.get.mockResolvedValue({data: {data: mockCategories}});

      const result = await categoryService.getCategories();

      expect(mockedApiClient.get).toHaveBeenCalledWith('/category');
      expect(result).toEqual(mockCategories);
    });

    it('should return empty array when API returns no categories', async () => {
      mockedApiClient.get.mockResolvedValue({data: {data: []}});

      const result = await categoryService.getCategories();

      expect(result).toEqual([]);
    });

    it('should propagate API errors', async () => {
      mockedApiClient.get.mockRejectedValue(new Error('Network error'));
      await expect(categoryService.getCategories()).rejects.toThrow('Network error');
    });
  });
});
