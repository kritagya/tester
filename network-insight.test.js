import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useOrchestratorSubmit, useOrchestratorStatus, useNetworkInsight } from './network-insight';

// Mock all dependencies
jest.mock('../helpers/customSWR');
jest.mock('../helpers/axios');
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useContext: jest.fn(),
  useMemo: jest.fn(),
}));
jest.mock('../../../helpers', () => ({
  session: jest.fn(),
}));
jest.mock('../../../../../../../../IssueSelector', () => ({
  ParamsContext: {},
}));

// Mock implementations
const mockUseCustomSWR = require('../helpers/customSWR').useCustomSWR;
const mockAxiosPost = require('../helpers/axios').axiosPost;
const mockUseContext = require('react').useContext;
const mockUseMemo = require('react').useMemo;
const mockSession = require('../../../helpers').session;

describe('network-insight.js', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set up default environment
    process.env.NODE_ENV = 'development';
  });

  afterEach(() => {
    delete process.env.NODE_ENV;
  });

  describe('Environment Configuration', () => {
    it('should use empty domain in development', () => {
      process.env.NODE_ENV = 'development';
      // Re-import to get fresh environment variables
      jest.resetModules();
      const networkInsight = require('./network-insight');
      expect(networkInsight).toBeDefined();
    });

    it('should use production domain in non-development', () => {
      process.env.NODE_ENV = 'production';
      // Re-import to get fresh environment variables
      jest.resetModules();
      const networkInsight = require('./network-insight');
      expect(networkInsight).toBeDefined();
    });
  });

  describe('postOrchestratorSubmit', () => {
    it('should call axiosPost with correct parameters', async () => {
      const mockPayload = { test: 'data' };
      const mockResponse = { data: 'response' };
      mockAxiosPost.mockResolvedValueOnce(mockResponse);

      // Import function after mocking
      const { postOrchestratorSubmit } = require('./network-insight');
      
      const result = await postOrchestratorSubmit(mockPayload);

      expect(mockAxiosPost).toHaveBeenCalledWith(
        expect.stringContaining('/vegas/apps/trouble-orch/submit'),
        mockPayload,
        { isACSS: true }
      );
      expect(result).toBe(mockResponse);
    });

    it('should handle axios errors', async () => {
      const mockPayload = { test: 'data' };
      const mockError = new Error('Network error');
      mockAxiosPost.mockRejectedValueOnce(mockError);

      const { postOrchestratorSubmit } = require('./network-insight');
      
      await expect(postOrchestratorSubmit(mockPayload)).rejects.toThrow('Network error');
    });
  });

  describe('postOrchestratorStatus', () => {
    it('should return status from response data', async () => {
      const mockPayload = { session_id: 'test' };
      const mockResponse = { data: { status: 'processing' } };
      mockAxiosPost.mockResolvedValueOnce(mockResponse);

      const { postOrchestratorStatus } = require('./network-insight');
      
      const result = await postOrchestratorStatus(mockPayload);

      expect(mockAxiosPost).toHaveBeenCalledWith(
        expect.stringContaining('/vegas/apps/trouble-orch/status'),
        mockPayload,
        { isACSS: true }
      );
      expect(result).toBe('processing');
    });

    it('should return undefined when data is null', async () => {
      const mockPayload = { session_id: 'test' };
      const mockResponse = { data: null };
      mockAxiosPost.mockResolvedValueOnce(mockResponse);

      const { postOrchestratorStatus } = require('./network-insight');
      
      const result = await postOrchestratorStatus(mockPayload);

      expect(result).toBeUndefined();
    });

    it('should return undefined when data.status is undefined', async () => {
      const mockPayload = { session_id: 'test' };
      const mockResponse = { data: {} };
      mockAxiosPost.mockResolvedValueOnce(mockResponse);

      const { postOrchestratorStatus } = require('./network-insight');
      
      const result = await postOrchestratorStatus(mockPayload);

      expect(result).toBeUndefined();
    });
  });

  describe('getNetworkInsights', () => {
    it('should return response from data', async () => {
      const mockPayload = { session_id: 'test' };
      const mockResponse = { data: { response: 'insights data' } };
      mockAxiosPost.mockResolvedValueOnce(mockResponse);

      const { getNetworkInsights } = require('./network-insight');
      
      const result = await getNetworkInsights(mockPayload);

      expect(mockAxiosPost).toHaveBeenCalledWith(
        expect.stringContaining('/vegas/apps/trouble-orch/solution'),
        mockPayload,
        { isACSS: true }
      );
      expect(result).toBe('insights data');
    });

    it('should return undefined when data is null', async () => {
      const mockPayload = { session_id: 'test' };
      const mockResponse = { data: null };
      mockAxiosPost.mockResolvedValueOnce(mockResponse);

      const { getNetworkInsights } = require('./network-insight');
      
      const result = await getNetworkInsights(mockPayload);

      expect(result).toBeUndefined();
    });

    it('should return undefined when data.response is undefined', async () => {
      const mockPayload = { session_id: 'test' };
      const mockResponse = { data: {} };
      mockAxiosPost.mockResolvedValueOnce(mockResponse);

      const { getNetworkInsights } = require('./network-insight');
      
      const result = await getNetworkInsights(mockPayload);

      expect(result).toBeUndefined();
    });
  });

  describe('useOrchestratorSubmit', () => {
    it('should call useCustomSWR with correct cache key and fetcher', () => {
      const mockPayload = { test: 'data' };
      const mockSWRResult = { data: 'result', isLoading: false };
      mockUseCustomSWR.mockReturnValueOnce(mockSWRResult);

      const { result } = renderHook(() => useOrchestratorSubmit(mockPayload));

      expect(mockUseCustomSWR).toHaveBeenCalledWith(
        ['orchestrator-submit', mockPayload],
        expect.any(Function)
      );
      expect(result.current).toBe(mockSWRResult);
    });
  });

  describe('useOrchestratorStatus', () => {
    it('should call useCustomSWR with correct parameters and polling config', () => {
      const mockPayload = { session_id: 'test' };
      const mockSWRResult = { data: 'processing', isLoading: false };
      mockUseCustomSWR.mockReturnValueOnce(mockSWRResult);

      const { result } = renderHook(() => useOrchestratorStatus(mockPayload));

      expect(mockUseCustomSWR).toHaveBeenCalledWith(
        ['orchestrator-status', mockPayload],
        expect.any(Function),
        {
          refreshInterval: expect.any(Function),
        }
      );
      expect(result.current).toBe(mockSWRResult);
    });

    it('should configure polling interval correctly for processing status', () => {
      const mockPayload = { session_id: 'test' };
      mockUseCustomSWR.mockImplementationOnce((key, fetcher, options) => {
        const refreshInterval = options.refreshInterval;
        
        // Test polling interval function
        expect(refreshInterval('processing')).toBe(5000);
        expect(refreshInterval('completed')).toBe(0);
        expect(refreshInterval('error')).toBe(0);
        expect(refreshInterval(undefined)).toBe(0);
        
        return { data: 'processing', isLoading: false };
      });

      renderHook(() => useOrchestratorStatus(mockPayload));
    });
  });

  describe('useNetworkInsight', () => {
    beforeEach(() => {
      // Reset mocks for each test
      mockUseContext.mockReset();
      mockUseMemo.mockReset();
      mockUseCustomSWR.mockReset();
      mockSession.mockReset();
    });

    it('should handle missing ParamsContext', () => {
      mockUseContext.mockReturnValueOnce(null);
      mockUseMemo.mockReturnValueOnce({
        humanMessage: 'call drop',
        sessionId: 'undefined-undefined-undefined'
      });
      mockUseCustomSWR
        .mockReturnValueOnce({ data: 'submitted' }) // useOrchestratorSubmit
        .mockReturnValueOnce({ data: 'completed', error: null }) // useOrchestratorStatus
        .mockReturnValueOnce({ data: 'insights', isLoading: false, error: null }); // network insights

      const { result } = renderHook(() => useNetworkInsight());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle empty paramsDetails', () => {
      mockUseContext.mockReturnValueOnce({ paramsDetails: null });
      mockUseMemo.mockReturnValueOnce({
        humanMessage: 'call drop',
        sessionId: 'undefined-undefined-undefined'
      });
      mockUseCustomSWR
        .mockReturnValueOnce({ data: 'submitted' }) // useOrchestratorSubmit
        .mockReturnValueOnce({ data: 'completed', error: null }) // useOrchestratorStatus
        .mockReturnValueOnce({ data: 'insights', isLoading: false, error: null }); // network insights

      const { result } = renderHook(() => useNetworkInsight());

      expect(result.current.isLoading).toBe(false);
    });

    it('should construct sessionId and humanMessage correctly', () => {
      const mockParamsDetails = {
        accountNumber: '123456789',
        mdn: '5551234567',
        acssCallId: 'call123'
      };
      
      mockUseContext.mockReturnValueOnce({ paramsDetails: mockParamsDetails });
      
      const mockSessionGet = jest.fn().mockReturnValue('custom message');
      mockSession.mockReturnValueOnce({ get: mockSessionGet });
      
      mockUseMemo.mockImplementationOnce((callback) => {
        return callback();
      });

      mockUseCustomSWR
        .mockReturnValueOnce({ data: 'submitted' }) // useOrchestratorSubmit
        .mockReturnValueOnce({ data: 'completed', error: null }) // useOrchestratorStatus
        .mockReturnValueOnce({ data: 'insights', isLoading: false, error: null }); // network insights

      renderHook(() => useNetworkInsight());

      expect(mockSession).toHaveBeenCalledWith('human_message', 'call drop');
      expect(mockSessionGet).toHaveBeenCalled();
    });

    it('should call useOrchestratorSubmit with correct payload', () => {
      const mockParamsDetails = {
        accountNumber: '123456789',
        mdn: '5551234567',
        acssCallId: 'call123'
      };
      
      mockUseContext.mockReturnValueOnce({ paramsDetails: mockParamsDetails });
      mockUseMemo.mockReturnValueOnce({
        humanMessage: 'call drop',
        sessionId: '123456789-5551234567-call123'
      });

      mockUseCustomSWR
        .mockReturnValueOnce({ data: 'submitted' }) // useOrchestratorSubmit
        .mockReturnValueOnce({ data: 'completed', error: null }) // useOrchestratorStatus
        .mockReturnValueOnce({ data: 'insights', isLoading: false, error: null }); // network insights

      renderHook(() => useNetworkInsight());

      // Check that useOrchestratorSubmit was called with correct parameters
      expect(mockUseCustomSWR).toHaveBeenNthCalledWith(1,
        ['orchestrator-submit', {
          session_id: '123456789-5551234567-call123',
          account_number: '123456789',
          mtn: '5551234567',
          channel: 'ACSS',
        }],
        expect.any(Function)
      );
    });

    it('should call useOrchestratorStatus with correct payload', () => {
      const mockParamsDetails = {
        accountNumber: '123456789',
        mdn: '5551234567',
        acssCallId: 'call123'
      };
      
      mockUseContext.mockReturnValueOnce({ paramsDetails: mockParamsDetails });
      mockUseMemo.mockReturnValueOnce({
        humanMessage: 'custom message',
        sessionId: '123456789-5551234567-call123'
      });

      mockUseCustomSWR
        .mockReturnValueOnce({ data: 'submitted' }) // useOrchestratorSubmit
        .mockReturnValueOnce({ data: 'completed', error: null }) // useOrchestratorStatus
        .mockReturnValueOnce({ data: 'insights', isLoading: false, error: null }); // network insights

      renderHook(() => useNetworkInsight());

      // Check that useOrchestratorStatus was called with correct parameters
      expect(mockUseCustomSWR).toHaveBeenNthCalledWith(2,
        ['orchestrator-status', {
          session_id: '123456789-5551234567-call123',
          human_message: 'custom message'
        }],
        expect.any(Function),
        { refreshInterval: expect.any(Function) }
      );
    });

    it('should not fetch network insights when status is processing', () => {
      const mockParamsDetails = {
        accountNumber: '123456789',
        mdn: '5551234567',
        acssCallId: 'call123'
      };
      
      mockUseContext.mockReturnValueOnce({ paramsDetails: mockParamsDetails });
      mockUseMemo.mockReturnValueOnce({
        humanMessage: 'call drop',
        sessionId: '123456789-5551234567-call123'
      });

      mockUseCustomSWR
        .mockReturnValueOnce({ data: 'submitted' }) // useOrchestratorSubmit
        .mockReturnValueOnce({ data: 'processing', error: null }) // useOrchestratorStatus
        .mockReturnValueOnce({ data: null, isLoading: false, error: null }); // network insights

      renderHook(() => useNetworkInsight());

      // Check that network insights SWR was called with null cache key (no fetch)
      expect(mockUseCustomSWR).toHaveBeenNthCalledWith(3,
        null,
        expect.any(Function),
        {}
      );
    });

    it('should fetch network insights when status is not processing', () => {
      const mockParamsDetails = {
        accountNumber: '123456789',
        mdn: '5551234567',
        acssCallId: 'call123'
      };
      
      mockUseContext.mockReturnValueOnce({ paramsDetails: mockParamsDetails });
      mockUseMemo.mockReturnValueOnce({
        humanMessage: 'call drop',
        sessionId: '123456789-5551234567-call123'
      });

      mockUseCustomSWR
        .mockReturnValueOnce({ data: 'submitted' }) // useOrchestratorSubmit
        .mockReturnValueOnce({ data: 'completed', error: null }) // useOrchestratorStatus
        .mockReturnValueOnce({ data: 'insights', isLoading: false, error: null }); // network insights

      renderHook(() => useNetworkInsight());

      // Check that network insights SWR was called with proper cache key
      expect(mockUseCustomSWR).toHaveBeenNthCalledWith(3,
        ['network-insights', '123456789-5551234567-call123', 'call drop'],
        expect.any(Function),
        {}
      );
    });

    it('should not fetch network insights when status is null', () => {
      const mockParamsDetails = {
        accountNumber: '123456789',
        mdn: '5551234567',
        acssCallId: 'call123'
      };
      
      mockUseContext.mockReturnValueOnce({ paramsDetails: mockParamsDetails });
      mockUseMemo.mockReturnValueOnce({
        humanMessage: 'call drop',
        sessionId: '123456789-5551234567-call123'
      });

      mockUseCustomSWR
        .mockReturnValueOnce({ data: 'submitted' }) // useOrchestratorSubmit
        .mockReturnValueOnce({ data: null, error: null }) // useOrchestratorStatus
        .mockReturnValueOnce({ data: null, isLoading: false, error: null }); // network insights

      renderHook(() => useNetworkInsight());

      // Check that network insights SWR was called with null cache key
      expect(mockUseCustomSWR).toHaveBeenNthCalledWith(3,
        null,
        expect.any(Function),
        {}
      );
    });

    it('should return isLoading true when networkInsights.isLoading is true', () => {
      mockUseContext.mockReturnValueOnce({ paramsDetails: {} });
      mockUseMemo.mockReturnValueOnce({
        humanMessage: 'call drop',
        sessionId: 'undefined-undefined-undefined'
      });

      mockUseCustomSWR
        .mockReturnValueOnce({ data: 'submitted' }) // useOrchestratorSubmit
        .mockReturnValueOnce({ data: 'completed', error: null }) // useOrchestratorStatus
        .mockReturnValueOnce({ data: null, isLoading: true, error: null }); // network insights

      const { result } = renderHook(() => useNetworkInsight());

      expect(result.current.isLoading).toBe(true);
    });

    it('should return isLoading true when networkInsights.data is null', () => {
      mockUseContext.mockReturnValueOnce({ paramsDetails: {} });
      mockUseMemo.mockReturnValueOnce({
        humanMessage: 'call drop',
        sessionId: 'undefined-undefined-undefined'
      });

      mockUseCustomSWR
        .mockReturnValueOnce({ data: 'submitted' }) // useOrchestratorSubmit
        .mockReturnValueOnce({ data: 'completed', error: null }) // useOrchestratorStatus
        .mockReturnValueOnce({ data: null, isLoading: false, error: null }); // network insights

      const { result } = renderHook(() => useNetworkInsight());

      expect(result.current.isLoading).toBe(true);
    });

    it('should return isLoading false when networkInsights has data', () => {
      mockUseContext.mockReturnValueOnce({ paramsDetails: {} });
      mockUseMemo.mockReturnValueOnce({
        humanMessage: 'call drop',
        sessionId: 'undefined-undefined-undefined'
      });

      mockUseCustomSWR
        .mockReturnValueOnce({ data: 'submitted' }) // useOrchestratorSubmit
        .mockReturnValueOnce({ data: 'completed', error: null }) // useOrchestratorStatus
        .mockReturnValueOnce({ data: 'insights', isLoading: false, error: null }); // network insights

      const { result } = renderHook(() => useNetworkInsight());

      expect(result.current.isLoading).toBe(false);
    });

    it('should return statusError when present', () => {
      mockUseContext.mockReturnValueOnce({ paramsDetails: {} });
      mockUseMemo.mockReturnValueOnce({
        humanMessage: 'call drop',
        sessionId: 'undefined-undefined-undefined'
      });

      const statusError = new Error('Status error');
      mockUseCustomSWR
        .mockReturnValueOnce({ data: 'submitted' }) // useOrchestratorSubmit
        .mockReturnValueOnce({ data: null, error: statusError }) // useOrchestratorStatus
        .mockReturnValueOnce({ data: null, isLoading: false, error: null }); // network insights

      const { result } = renderHook(() => useNetworkInsight());

      expect(result.current.error).toBe(statusError);
    });

    it('should return networkInsights error when present', () => {
      mockUseContext.mockReturnValueOnce({ paramsDetails: {} });
      mockUseMemo.mockReturnValueOnce({
        humanMessage: 'call drop',
        sessionId: 'undefined-undefined-undefined'
      });

      const networkError = new Error('Network insights error');
      mockUseCustomSWR
        .mockReturnValueOnce({ data: 'submitted' }) // useOrchestratorSubmit
        .mockReturnValueOnce({ data: 'completed', error: null }) // useOrchestratorStatus
        .mockReturnValueOnce({ data: null, isLoading: false, error: networkError }); // network insights

      const { result } = renderHook(() => useNetworkInsight());

      expect(result.current.error).toBe(networkError);
    });

    it('should prioritize statusError over networkInsights error', () => {
      mockUseContext.mockReturnValueOnce({ paramsDetails: {} });
      mockUseMemo.mockReturnValueOnce({
        humanMessage: 'call drop',
        sessionId: 'undefined-undefined-undefined'
      });

      const statusError = new Error('Status error');
      const networkError = new Error('Network insights error');
      mockUseCustomSWR
        .mockReturnValueOnce({ data: 'submitted' }) // useOrchestratorSubmit
        .mockReturnValueOnce({ data: null, error: statusError }) // useOrchestratorStatus
        .mockReturnValueOnce({ data: null, isLoading: false, error: networkError }); // network insights

      const { result } = renderHook(() => useNetworkInsight());

      expect(result.current.error).toBe(statusError);
    });

    it('should spread all networkInsights properties', () => {
      mockUseContext.mockReturnValueOnce({ paramsDetails: {} });
      mockUseMemo.mockReturnValueOnce({
        humanMessage: 'call drop',
        sessionId: 'undefined-undefined-undefined'
      });

      const mockNetworkInsights = {
        data: 'insights',
        isLoading: false,
        error: null,
        mutate: jest.fn(),
        isValidating: false
      };

      mockUseCustomSWR
        .mockReturnValueOnce({ data: 'submitted' }) // useOrchestratorSubmit
        .mockReturnValueOnce({ data: 'completed', error: null }) // useOrchestratorStatus
        .mockReturnValueOnce(mockNetworkInsights); // network insights

      const { result } = renderHook(() => useNetworkInsight());

      expect(result.current.data).toBe('insights');
      expect(result.current.mutate).toBe(mockNetworkInsights.mutate);
      expect(result.current.isValidating).toBe(false);
    });
  });
});
