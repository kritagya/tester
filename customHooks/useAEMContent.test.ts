import { renderHook } from '@testing-library/react';
import { useAEMContent } from '../useAEMContent';

// Mock the aemContentQuery and useSuspenseQuery
jest.mock('@/servicelibs/aemContent', () => ({
  aemContentQuery: { queryKey: ['aem'], queryFn: jest.fn() },
}));
jest.mock('@tanstack/react-query', () => ({
  useSuspenseQuery: jest.fn(),
}));

describe('useAEMContent', () => {
  it('calls useSuspenseQuery with aemContentQuery', () => {
    const { aemContentQuery } = require('@/servicelibs/aemContent');
    const { useSuspenseQuery } = require('@tanstack/react-query');

    // Optionally, set a mock return value
    useSuspenseQuery.mockReturnValue({ data: 'mockData' });

    const { result } = renderHook(() => useAEMContent());

    expect(useSuspenseQuery).toHaveBeenCalledWith(aemContentQuery);
    expect(result.current).toEqual({ data: 'mockData' });
  });
}); 