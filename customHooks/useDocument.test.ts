import { renderHook, RenderHookResult } from '@testing-library/react';
import { useDocumentContent } from '../useDocument';
import { getDocuments } from '@/actions/getDocuments';
import { useQuery } from '@tanstack/react-query';

interface MockData {
  data: string;
}

// Mock the dependencies
jest.mock('@/actions/getDocuments', () => ({
  getDocuments: jest.fn(),
}));

const mockUseQuery = jest.fn() as jest.MockedFunction<typeof useQuery>;
jest.mock('@tanstack/react-query', () => ({
  useQuery: () => mockUseQuery(),
}));

describe('useDocumentContent', () => {
  it('calls useQuery with the correct query key and query function', () => {
    const mockData: MockData = { data: 'mockData' };
    (mockUseQuery as jest.Mock).mockReturnValue(mockData);

    const endPoint: string = 'test-endpoint';
    const { result }: RenderHookResult<MockData> = renderHook(() => useDocumentContent(endPoint));

    expect(mockUseQuery).toHaveBeenCalledWith({
      queryKey: ['document-content', endPoint],
      queryFn: expect.any(Function),
      enabled: false,
    });
    expect(result.current).toEqual(mockData);
  });
});
