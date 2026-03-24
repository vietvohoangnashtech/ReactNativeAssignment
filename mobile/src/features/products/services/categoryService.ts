import apiClient from '../../../services/api/client';
import type {ApiResponse} from '../../../types/api/response.types';
import type {Category} from '../types/category.types';

const categoryService = {
  getCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get<ApiResponse<Category[]>>('/category');
    return response.data.data;
  },
};

export {categoryService};
