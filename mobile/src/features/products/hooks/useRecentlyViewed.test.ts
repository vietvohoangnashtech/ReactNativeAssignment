import {renderHook, act, waitFor} from '@testing-library/react-native';
import {useRecentlyViewed} from './useRecentlyViewed';
import {recentlyViewedRepository} from '../../../services/database/repositories/recentlyViewedRepository';

// ─── Mock ────────────────────────────────────────────────────────────────────

jest.mock(
  '../../../services/database/repositories/recentlyViewedRepository',
  () => ({
    recentlyViewedRepository: {
      getRecentlyViewed: jest.fn(),
      trackView: jest.fn(),
      clearHistory: jest.fn(),
    },
  }),
);

const mockedRepo = recentlyViewedRepository as jest.Mocked<
  typeof recentlyViewedRepository
>;

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockProducts = [
  {id: 1, name: 'Product A', price: 10, description: '', image: '', priceUnit: 'dollar', category: 'test'},
  {id: 2, name: 'Product B', price: 20, description: '', image: '', priceUnit: 'dollar', category: 'test'},
];

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useRecentlyViewed', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should load recently viewed products on mount', async () => {
    mockedRepo.getRecentlyViewed.mockResolvedValue(mockProducts as any);
    const {result} = renderHook(() => useRecentlyViewed());

    await waitFor(() => {
      expect(result.current.recentProducts).toEqual(mockProducts);
    });
    expect(mockedRepo.getRecentlyViewed).toHaveBeenCalledTimes(1);
  });

  it('should start with empty array', () => {
    mockedRepo.getRecentlyViewed.mockResolvedValue([]);
    const {result} = renderHook(() => useRecentlyViewed());
    expect(result.current.recentProducts).toEqual([]);
  });

  it('should provide a refresh function', async () => {
    mockedRepo.getRecentlyViewed
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce(mockProducts as any);

    const {result} = renderHook(() => useRecentlyViewed());

    await waitFor(() => {
      expect(mockedRepo.getRecentlyViewed).toHaveBeenCalledTimes(1);
    });

    await act(async () => {
      await result.current.refresh();
    });

    expect(mockedRepo.getRecentlyViewed).toHaveBeenCalledTimes(2);
    expect(result.current.recentProducts).toEqual(mockProducts);
  });
});
