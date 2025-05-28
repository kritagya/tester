'use client';

import { useState, useMemo, useCallback } from 'react';
import dayjs from 'dayjs';

type SortDirection = 'asc' | 'desc';

interface PaginationInput<T> {
  data: T[];
  pageSize?: number;
  filters?: Array<{ key: string; value: any[] }>;
  sortKey?: keyof T;
  sortKeyType?: string;
  sortDirection?: SortDirection;
  search?: string;
  infinity?: boolean;
}

export interface PaginationOutput<T> {
  currentPage: number;
  totalPages: number;
  pageData: T[];
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  loadMore: () => void;
  hasMore: boolean;
  isFirst: boolean;
  isLast: boolean;
}

export function usePagination<T>({
  data,
  pageSize,
  filters = [],
  sortKey,
  sortKeyType,
  sortDirection = 'asc',
  search = '',
  infinity = false,
}: PaginationInput<T>): PaginationOutput<T> {
  const _pageSize = pageSize || data.length || 10;
  const [currentPage, setCurrentPage] = useState(1);

  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    // Apply filters
    result = result.filter(item =>
      filters.every(({ key, value }) => {
        const cleanedValue = value.filter(Boolean);
        return (
          cleanedValue.length === 0 || cleanedValue.includes((item as any)[key])
        );
      })
    );

    // Apply search
    if (search) {
      result = result.filter((item: any) =>
        Object.values(item).some(
          val =>
            typeof val === 'string' &&
            val.toLowerCase().includes(search.toLowerCase())
        )
      );
    }

    // Apply sorting
    if (sortKey) {
      if (sortKeyType === 'date') {
        result.sort((a, b) => {
          return dayjs(a[sortKey] as string).isBefore(b[sortKey] as string)
            ? 1
            : -1;
        });
      } else {
        result.sort((a, b) => {
          if (a[sortKey] < b[sortKey]) return sortDirection === 'asc' ? -1 : 1;
          if (a[sortKey] > b[sortKey]) return sortDirection === 'asc' ? 1 : -1;
          return 0;
        });
      }
    }

    return result;
  }, [data, filters, search, sortKey, sortDirection]);

  const totalPages = Math.ceil(filteredAndSortedData.length / _pageSize);

  const pageData = useMemo(() => {
    const start = (currentPage - 1) * _pageSize;
    const end = infinity ? currentPage * _pageSize : start + _pageSize;
    return infinity
      ? filteredAndSortedData.slice(0, end)
      : filteredAndSortedData.slice(start, end);
  }, [filteredAndSortedData, currentPage, _pageSize, infinity]);

  const goToPage = useCallback(
    (page: number) => {
      setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    },
    [totalPages]
  );

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  }, [currentPage, totalPages]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  }, [currentPage]);

  const loadMore = useCallback(() => {
    if (infinity && currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  }, [infinity, currentPage, totalPages]);

  const hasMore = currentPage < totalPages;
  const isFirst = currentPage === 1;
  const isLast = currentPage === totalPages;

  return {
    currentPage,
    totalPages,
    pageData,
    goToPage,
    nextPage,
    prevPage,
    loadMore,
    hasMore,
    isFirst,
    isLast,
  };
}
