import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useNetworkInsight } from './ai-insight-hooks';

// Mock all dependencies
jest.mock('./network-insight', () => ({
  useNetworkInsight: jest.fn()
}));

// Mock the ParamsContext
jest.mock('../../../../../../../../IssueSelector', () => ({
  ParamsContext: React.createContext()
}));

// Mock useParamDetails
jest.mock('../helpers/useParamDetails', () => ({
  useParamsDetails: jest.fn()
}));

const mockUseNetworkInsightFromFile = require('./network-insight').useNetworkInsight;
const mockUseParamsDetails = require('../helpers/useParamDetails').useParamsDetails;

describe('ai-insight-hooks.js', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up default mock returns
    mockUseParamsDetails.mockReturnValue({
      acssCallId: 'test-call-123',
      accountNumber: '1234567890',
      mdn: '5551234567',
      theme: {
        isDark: false,
        surface: 'light'
      }
    });
  });

  describe('useNetworkInsight hook', () => {
    it('should return data from network-insight useNetworkInsight hook', () => {
      const mockData = {
        data: {
          transactionId: 'test-txn-123',
          summary: { data: ['Test summary'] },
          recommendations: [{ title: 'Test recommendation', steps: ['Step 1'] }]
        },
        isLoading: false,
        error: null
      };

      mockUseNetworkInsightFromFile.mockReturnValue(mockData);

      const { result } = renderHook(() => useNetworkInsight());

      expect(result.current).toEqual(mockData);
      expect(mockUseNetworkInsightFromFile).toHaveBeenCalled();
    });

    it('should handle loading state', () => {
      const mockLoadingData = {
        data: null,
        isLoading: true,
        error: null
      };

      mockUseNetworkInsightFromFile.mockReturnValue(mockLoadingData);

      const { result } = renderHook(() => useNetworkInsight());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeNull();
    });

    it('should handle error state', () => {
      const mockError = new Error('Network error');
      const mockErrorData = {
        data: null,
        isLoading: false,
        error: mockError
      };

      mockUseNetworkInsightFromFile.mockReturnValue(mockErrorData);

      const { result } = renderHook(() => useNetworkInsight());

      expect(result.current.error).toBe(mockError);
      expect(result.current.data).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle undefined return from network-insight hook', () => {
      mockUseNetworkInsightFromFile.mockReturnValue(undefined);

      const { result } = renderHook(() => useNetworkInsight());

      expect(result.current).toBeUndefined();
    });

    it('should handle null return from network-insight hook', () => {
      mockUseNetworkInsightFromFile.mockReturnValue(null);

      const { result } = renderHook(() => useNetworkInsight());

      expect(result.current).toBeNull();
    });

    it('should re-render when dependencies change', () => {
      const initialData = {
        data: { transactionId: 'initial' },
        isLoading: false,
        error: null
      };

      const updatedData = {
        data: { transactionId: 'updated' },
        isLoading: false,
        error: null
      };

      mockUseNetworkInsightFromFile.mockReturnValueOnce(initialData);
      
      const { result, rerender } = renderHook(() => useNetworkInsight());

      expect(result.current.data.transactionId).toBe('initial');

      mockUseNetworkInsightFromFile.mockReturnValueOnce(updatedData);
      rerender();

      expect(result.current.data.transactionId).toBe('updated');
    });

    it('should maintain referential stability when data doesn\'t change', () => {
      const stableData = {
        data: { transactionId: 'stable' },
        isLoading: false,
        error: null
      };

      mockUseNetworkInsightFromFile.mockReturnValue(stableData);

      const { result, rerender } = renderHook(() => useNetworkInsight());

      const firstResult = result.current;
      rerender();
      const secondResult = result.current;

      expect(firstResult).toBe(secondResult);
    });

    it('should handle complex data structures', () => {
      const complexData = {
        data: {
          transactionId: 'complex-test',
          summary: {
            data: [
              'Complex summary item 1',
              'Complex summary item 2'
            ],
            metadata: {
              timestamp: '2023-01-01T00:00:00Z',
              version: '1.0.0'
            }
          },
          recommendations: [
            {
              title: 'Complex Recommendation 1',
              steps: [
                'Step 1 with detailed instructions',
                'Step 2 with more complexity'
              ],
              link: 'https://example.com/complex-guide',
              metadata: {
                priority: 'high',
                category: 'network'
              }
            }
          ]
        },
        isLoading: false,
        error: null,
        mutate: jest.fn(),
        isValidating: false
      };

      mockUseNetworkInsightFromFile.mockReturnValue(complexData);

      const { result } = renderHook(() => useNetworkInsight());

      expect(result.current.data.summary.metadata.version).toBe('1.0.0');
      expect(result.current.data.recommendations[0].metadata.priority).toBe('high');
      expect(typeof result.current.mutate).toBe('function');
    });

    it('should handle async state changes', async () => {
      const loadingData = {
        data: null,
        isLoading: true,
        error: null
      };

      const successData = {
        data: { transactionId: 'async-success' },
        isLoading: false,
        error: null
      };

      mockUseNetworkInsightFromFile.mockReturnValueOnce(loadingData);

      const { result, rerender } = renderHook(() => useNetworkInsight());

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        mockUseNetworkInsightFromFile.mockReturnValueOnce(successData);
        rerender();
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.data.transactionId).toBe('async-success');
    });

    it('should handle multiple concurrent hook instances', () => {
      const data1 = {
        data: { transactionId: 'instance-1' },
        isLoading: false,
        error: null
      };

      const data2 = {
        data: { transactionId: 'instance-2' },
        isLoading: false,
        error: null
      };

      mockUseNetworkInsightFromFile
        .mockReturnValueOnce(data1)
        .mockReturnValueOnce(data2);

      const { result: result1 } = renderHook(() => useNetworkInsight());
      const { result: result2 } = renderHook(() => useNetworkInsight());

      expect(result1.current.data.transactionId).toBe('instance-1');
      expect(result2.current.data.transactionId).toBe('instance-2');
    });
  });

  describe('Integration with useParamsDetails', () => {
    it('should work when useParamsDetails is available', () => {
      mockUseParamsDetails.mockReturnValue({
        acssCallId: 'integration-test',
        theme: { isDark: true }
      });

      const mockData = {
        data: { transactionId: 'integration-success' },
        isLoading: false,
        error: null
      };

      mockUseNetworkInsightFromFile.mockReturnValue(mockData);

      const { result } = renderHook(() => useNetworkInsight());

      expect(result.current.data.transactionId).toBe('integration-success');
      expect(mockUseNetworkInsightFromFile).toHaveBeenCalled();
    });

    it('should work when useParamsDetails returns null', () => {
      mockUseParamsDetails.mockReturnValue(null);

      const mockData = {
        data: { transactionId: 'null-params-success' },
        isLoading: false,
        error: null
      };

      mockUseNetworkInsightFromFile.mockReturnValue(mockData);

      const { result } = renderHook(() => useNetworkInsight());

      expect(result.current.data.transactionId).toBe('null-params-success');
    });
  });

  describe('Error handling and edge cases', () => {
    it('should handle when network-insight hook throws an error', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      mockUseNetworkInsightFromFile.mockImplementation(() => {
        throw new Error('Hook implementation error');
      });

      expect(() => {
        renderHook(() => useNetworkInsight());
      }).toThrow('Hook implementation error');

      consoleSpy.mockRestore();
    });

    it('should handle malformed data gracefully', () => {
      const malformedData = {
        data: 'this should be an object',
        isLoading: 'this should be a boolean',
        error: 'this should be an error object or null'
      };

      mockUseNetworkInsightFromFile.mockReturnValue(malformedData);

      const { result } = renderHook(() => useNetworkInsight());

      expect(result.current).toEqual(malformedData);
    });

    it('should handle extremely large data sets', () => {
      const largeData = {
        data: {
          transactionId: 'large-data-test',
          summary: {
            data: Array.from({ length: 1000 }, (_, i) => `Summary item ${i + 1}`)
          },
          recommendations: Array.from({ length: 500 }, (_, i) => ({
            title: `Recommendation ${i + 1}`,
            steps: Array.from({ length: 20 }, (_, j) => `Step ${j + 1} for recommendation ${i + 1}`)
          }))
        },
        isLoading: false,
        error: null
      };

      mockUseNetworkInsightFromFile.mockReturnValue(largeData);

      const { result } = renderHook(() => useNetworkInsight());

      expect(result.current.data.summary.data).toHaveLength(1000);
      expect(result.current.data.recommendations).toHaveLength(500);
    });

    it('should handle rapid state transitions', () => {
      const states = [
        { data: null, isLoading: true, error: null },
        { data: { transactionId: 'partial' }, isLoading: true, error: null },
        { data: { transactionId: 'complete' }, isLoading: false, error: null },
        { data: null, isLoading: false, error: new Error('Failed') },
        { data: { transactionId: 'recovered' }, isLoading: false, error: null }
      ];

      const { result, rerender } = renderHook(() => useNetworkInsight());

      states.forEach((state, index) => {
        mockUseNetworkInsightFromFile.mockReturnValueOnce(state);
        rerender();
        
        expect(result.current.isLoading).toBe(state.isLoading);
        expect(result.current.error).toBe(state.error);
        
        if (state.data) {
          expect(result.current.data).toEqual(state.data);
        }
      });
    });
  });
});
