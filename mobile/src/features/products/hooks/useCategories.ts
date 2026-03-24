import {useEffect, useState} from 'react';
import {categoryService} from '../services/categoryService';
import type {Category} from '../types/category.types';

const ALL_CATEGORY: Category = {id: 0, name: 'All'};

const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([ALL_CATEGORY]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    categoryService
      .getCategories()
      .then(data => {
        setCategories([ALL_CATEGORY, ...data]);
      })
      .catch(() => {
        // keep the "All" fallback on error
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return {categories, loading};
};

export {useCategories};
