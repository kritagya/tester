import { renderHook } from '@testing-library/react';
import { useDocumentContent } from '../useDocument';
import { getDocuments } from '@/actions/getDocuments';
import { useQuery } from '@tanstack/react-query';

// Mock the dependencies
jest.mock('@/actions/getDocuments', () => ({
  getDocuments: jest.fn(),
}));

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
}));

describe('useDocumentContent', () => {
  it('calls useQuery with the correct query key and query function', () => {
    // Optionally, set a mock return value
    useQuery.mockReturnValue({ data: 'mockData' });

    const endPoint = 'test-endpoint';
    const { result } = renderHook(() => useDocumentContent(endPoint));

    expect(useQuery).toHaveBeenCalledWith({
      queryKey: ['document-content', endPoint],
      queryFn: expect.any(Function),
      enabled: false,
    });
    expect(result.current).toEqual({ data: 'mockData' });
  });
}); 
