import { renderHook } from '@testing-library/react';
import { useDocumentContent } from '../useDocument';

// Mock the dependencies
jest.mock('@/actions/getDocuments', () => ({
  getDocuments: jest.fn(),
}));

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
}));

describe('useDocumentContent', () => {
  it('calls useQuery with the correct query key and query function', () => {
    const { getDocuments } = require('@/actions/getDocuments');
    const { useQuery } = require('@tanstack/react-query');

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