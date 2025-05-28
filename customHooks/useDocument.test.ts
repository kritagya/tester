import { renderHook } from '@testing-library/react';
import { useDocumentContent } from '../useDocument';
import { useQuery } from '@tanstack/react-query';

interface MockData {
  data: string;
}

interface QueryError {
  message: string;
}

// Mock the dependencies
jest.mock('@/actions/getDocuments', () => ({
  getDocuments: jest.fn(),
}));

const mockUseQuery = jest.fn() as jest.MockedFunction<typeof useQuery>;
jest.mock('@tanstack/react-query', () => ({
  useQuery: (options: any) => mockUseQuery(options),
}));

describe('useDocumentContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls useQuery with the correct query key and query function', () => {
    const mockData: MockData = { data: 'mockData' };
    (mockUseQuery as jest.Mock).mockReturnValue(mockData);

    const endPoint: string = 'test-endpoint';
    const { result } = renderHook(() => useDocumentContent(endPoint));

    expect(mockUseQuery).toHaveBeenCalledWith({
      queryKey: ['document-content', endPoint],
      queryFn: expect.any(Function),
      enabled: false,
    });
    expect(result.current).toEqual(mockData);
  });

  it('handles query error', () => {
    const mockError: QueryError = { message: 'Error fetching document' };
    (mockUseQuery as jest.Mock).mockReturnValue({ 
      error: mockError,
      isError: true 
    });

    const endPoint: string = 'test-endpoint';
    const { result } = renderHook(() => useDocumentContent(endPoint));

    expect(result.current.error).toEqual(mockError);
    expect(result.current.isError).toBe(true);
  });

  it('handles loading state', () => {
    (mockUseQuery as jest.Mock).mockReturnValue({ 
      isLoading: true 
    });

    const endPoint: string = 'test-endpoint';
    const { result } = renderHook(() => useDocumentContent(endPoint));

    expect(result.current.isLoading).toBe(true);
  });
}); 
