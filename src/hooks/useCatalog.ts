import { useCallback, useEffect, useState } from 'react';
import { categories } from '../data/categories';
import { homeSections } from '../data/sections';
import { getProductById } from '../data/products';
import { Category, Product, ProductSectionData } from '../types';

export interface HomeFeed {
  categories: Category[];
  sections: Array<{
    id: string;
    title: string;
    subtitle?: string;
    products: Product[];
  }>;
}

interface CatalogState {
  data: HomeFeed | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
}

function hydrate(section: ProductSectionData) {
  return {
    id: section.id,
    title: section.title,
    subtitle: section.subtitle,
    products: section.productIds
      .map(getProductById)
      .filter((p): p is Product => p !== undefined),
  };
}

function buildFeed(): HomeFeed {
  return { categories, sections: homeSections.map(hydrate) };
}

/**
 * The home feed's data seam.
 *
 * Today it resolves local mock data behind a short delay so loading and refresh states are
 * real. Phase 2 swaps the body of `load` for `GET /home` — the returned shape, the error
 * string and the retry handler are already what the screen consumes.
 */
export function useCatalog() {
  const [state, setState] = useState<CatalogState>({
    data: null,
    isLoading: true,
    isRefreshing: false,
    error: null,
  });

  const load = useCallback(async (mode: 'initial' | 'refresh') => {
    setState((prev) => ({
      ...prev,
      isLoading: mode === 'initial',
      isRefreshing: mode === 'refresh',
      error: null,
    }));

    try {
      await new Promise((resolve) => setTimeout(resolve, mode === 'initial' ? 650 : 900));
      setState({ data: buildFeed(), isLoading: false, isRefreshing: false, error: null });
    } catch {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        isRefreshing: false,
        error: 'We could not load the store just now.',
      }));
    }
  }, []);

  useEffect(() => {
    void load('initial');
  }, [load]);

  const refresh = useCallback(() => load('refresh'), [load]);
  const retry = useCallback(() => load('initial'), [load]);

  return { ...state, refresh, retry };
}
