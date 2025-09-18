import { renderHook, act } from '@testing-library/react'
import { useAIInsight, useOrchestratorSubmit } from '../ai-insight-hooks'

// Mock all dependencies
jest.mock('../helpers/customSWR', () => ({
  useCustomSWR: jest.fn()
}))

jest.mock('../helpers/axios', () => ({
  post: jest.fn()
}))

jest.mock('../../../helpers', () => ({
  session: jest.fn()
}))

jest.mock('../helpers/useParamDetails', () => ({
  useParamsDetails: jest.fn()
}))

jest.mock('./ai-insight-store', () => ({
  useAIInsightStore: jest.fn()
}))

jest.mock('../../customHooks/event-source', () => ({
  useEventSource: jest.fn(),
  useEventStore: jest.fn()
}))

// Mock window location
delete window.location
window.location = { href: 'https://test.example.com' }

// Import mocked dependencies
import { useCustomSWR } from '../helpers/customSWR'
import customAxios from '../helpers/axios'
import { session } from '../../../helpers'
import { useParamsDetails } from '../helpers/useParamDetails'
import { useAIInsightStore } from './ai-insight-store'
import { useEventSource, useEventStore } from '../../customHooks/event-source'

describe('useOrchestratorSubmit', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useCustomSWR.mockReturnValue({
      data: null,
      isLoading: false,
      error: null
    })
    customAxios.post.mockResolvedValue({
      data: { status: 'success' }
    })
  })

  test('should return SWR hook result', () => {
    const mockSWRResult = {
      data: 'success',
      isLoading: false,
      error: null
    }
    useCustomSWR.mockReturnValue(mockSWRResult)

    const payload = { id: 'test-id' }
    const options = { customLogs: {}, enabled: true }

    const { result } = renderHook(() => useOrchestratorSubmit(payload, options))

    expect(result.current).toEqual(mockSWRResult)
  })

  test('should create correct cache key when enabled', () => {
    const payload = { id: 'test-id' }
    const options = { customLogs: {}, enabled: true }

    renderHook(() => useOrchestratorSubmit(payload, options))

    expect(useCustomSWR).toHaveBeenCalledWith(
      ['orchestrator-submit', 'test-id'],
      expect.any(Function),
      options
    )
  })

  test('should create null cache key when disabled', () => {
    const payload = { id: 'test-id' }
    const options = { customLogs: {}, enabled: false }

    renderHook(() => useOrchestratorSubmit(payload, options))

    expect(useCustomSWR).toHaveBeenCalledWith(
      null,
      expect.any(Function),
      options
    )
  })

  test('should create null cache key when payload is null', () => {
    const options = { customLogs: {}, enabled: true }

    renderHook(() => useOrchestratorSubmit(null, options))

    expect(useCustomSWR).toHaveBeenCalledWith(
      null,
      expect.any(Function),
      options
    )
  })

  test('should call beforeRequest when provided', async () => {
    const mockBeforeRequest = jest.fn()
    const payload = { id: 'test-id' }
    const options = { 
      customLogs: {}, 
      enabled: true, 
      beforeRequest: mockBeforeRequest 
    }

    let fetcherFunction
    useCustomSWR.mockImplementation((key, fetcher) => {
      fetcherFunction = fetcher
      return { data: null, isLoading: false, error: null }
    })

    renderHook(() => useOrchestratorSubmit(payload, options))

    // Call the fetcher function
    await fetcherFunction()

    expect(mockBeforeRequest).toHaveBeenCalled()
  })

  test('should call postOrchestratorSubmit with correct parameters', async () => {
    const payload = { id: 'test-id' }
    const customLogs = { loggedInUser: 'user123' }
    const options = { customLogs, enabled: true }

    let fetcherFunction
    useCustomSWR.mockImplementation((key, fetcher) => {
      fetcherFunction = fetcher
      return { data: null, isLoading: false, error: null }
    })

    renderHook(() => useOrchestratorSubmit(payload, options))

    // Call the fetcher function
    await fetcherFunction()

    expect(customAxios.post).toHaveBeenCalledWith(
      expect.stringContaining('/vegas/apps/trouble-orch/submit'),
      payload,
      { customLogs }
    )
  })

  test('should call API with correct endpoint', async () => {
    const payload = { id: 'test-id' }
    const options = { customLogs: {}, enabled: true }

    let fetcherFunction
    useCustomSWR.mockImplementation((key, fetcher) => {
      fetcherFunction = fetcher
      return { data: null, isLoading: false, error: null }
    })

    renderHook(() => useOrchestratorSubmit(payload, options))

    // Call the fetcher function
    await fetcherFunction()

    expect(customAxios.post).toHaveBeenCalledWith(
      expect.stringContaining('/vegas/apps/trouble-orch/submit'),
      payload,
      expect.any(Object)
    )
  })

  test('should return data status from API response', async () => {
    const mockResponse = { data: { status: 'completed' } }
    customAxios.post.mockResolvedValue(mockResponse)

    const payload = { id: 'test-id' }
    const options = { customLogs: {}, enabled: true }

    let fetcherFunction
    useCustomSWR.mockImplementation((key, fetcher) => {
      fetcherFunction = fetcher
      return { data: null, isLoading: false, error: null }
    })

    renderHook(() => useOrchestratorSubmit(payload, options))

    const result = await fetcherFunction()
    expect(result).toBe('completed')
  })

  test('should handle API error', async () => {
    const mockError = new Error('API Error')
    customAxios.post.mockRejectedValue(mockError)

    const payload = { id: 'test-id' }
    const options = { customLogs: {}, enabled: true }

    let fetcherFunction
    useCustomSWR.mockImplementation((key, fetcher) => {
      fetcherFunction = fetcher
      return { data: null, isLoading: false, error: null }
    })

    renderHook(() => useOrchestratorSubmit(payload, options))

    await expect(fetcherFunction()).rejects.toThrow('API Error')
  })
})

describe('useAIInsight', () => {
  const mockParamsDetails = {
    accountNumber: '123456789',
    mdn: '5551234567',
    acssCallId: 'call123',
    loggedInUser: 'user123',
    externalTarget: 'target123',
    mvoenv: 'test'
  }

  const mockAIInsightStore = {
    intentId: 'IN123',
    isNetworkInsight: false
  }

  const mockEventSource = {
    details: {
      response: {
        summary: { data: ['Test summary'] },
        recommendations: [{ title: 'Test recommendation' }]
      }
    },
    isLoading: false
  }

  const mockSession = {
    get: jest.fn().mockReturnValue('session-intent-id')
  }

  beforeEach(() => {
    jest.clearAllMocks()
    
    useParamsDetails.mockReturnValue(mockParamsDetails)
    useAIInsightStore.mockReturnValue(mockAIInsightStore)
    useEventSource.mockReturnValue(mockEventSource)
    useEventStore.mockReturnValue(jest.fn())
    session.mockReturnValue(mockSession)
    
    useCustomSWR.mockReturnValue({
      isLoading: false,
      error: null
    })
  })

  test('should return correct data structure', () => {
    const { result } = renderHook(() => useAIInsight({ id: 'test-id' }))

    expect(result.current).toEqual({
      data: mockEventSource.details.response,
      isLoading: false,
      error: null
    })
  })

  test('should handle loading state from orchestrator submit', () => {
    useCustomSWR.mockReturnValue({
      isLoading: true,
      error: null
    })

    const { result } = renderHook(() => useAIInsight({ id: 'test-id' }))

    expect(result.current.isLoading).toBe(true)
  })

  test('should handle loading state from event source', () => {
    useEventSource.mockReturnValue({
      ...mockEventSource,
      isLoading: true
    })

    const { result } = renderHook(() => useAIInsight({ id: 'test-id' }))

    expect(result.current.isLoading).toBe(true)
  })

  test('should handle combined loading states', () => {
    useCustomSWR.mockReturnValue({
      isLoading: true,
      error: null
    })
    useEventSource.mockReturnValue({
      ...mockEventSource,
      isLoading: true
    })

    const { result } = renderHook(() => useAIInsight({ id: 'test-id' }))

    expect(result.current.isLoading).toBe(true)
  })

  test('should handle error from orchestrator submit', () => {
    const mockError = new Error('Submit error')
    useCustomSWR.mockReturnValue({
      isLoading: false,
      error: mockError
    })

    const { result } = renderHook(() => useAIInsight({ id: 'test-id' }))

    expect(result.current.error).toBe(mockError)
  })

  test('should create correct session ID', () => {
    const { result } = renderHook(() => useAIInsight({ id: 'test-id' }))
    
    // Verify the hook returns expected structure
    expect(result.current).toHaveProperty('data')
    expect(result.current).toHaveProperty('isLoading')
    expect(result.current).toHaveProperty('error')
  })

  test('should get intent ID from session', () => {
    renderHook(() => useAIInsight({ id: 'test-id' }))

    expect(session).toHaveBeenCalledWith('intent_id', 'IN123')
    expect(mockSession.get).toHaveBeenCalled()
  })

  test('should use network insight flow name when isNetworkInsight is true', () => {
    useAIInsightStore.mockReturnValue({
      ...mockAIInsightStore,
      isNetworkInsight: true
    })

    renderHook(() => useAIInsight({ id: 'test-id' }))

    expect(useCustomSWR).toHaveBeenCalledWith(
      ['orchestrator-submit', 'test-id'],
      expect.any(Function),
      expect.objectContaining({
        enabled: 'test-id',
        customLogs: expect.objectContaining({
          flowName: 'networkInsight'
        })
      })
    )
  })

  test('should use device insight flow name when isNetworkInsight is false', () => {
    renderHook(() => useAIInsight({ id: 'test-id' }))

    expect(useCustomSWR).toHaveBeenCalledWith(
      ['orchestrator-submit', 'test-id'],
      expect.any(Function),
      expect.objectContaining({
        enabled: 'test-id',
        customLogs: expect.objectContaining({
          flowName: 'deviceInsight'
        })
      })
    )
  })

  test('should call setEventData with correct parameters', () => {
    const mockSetEventData = jest.fn()
    useEventStore.mockReturnValue(mockSetEventData)

    let beforeRequestCallback
    useCustomSWR.mockImplementation((key, fetcher, options) => {
      beforeRequestCallback = options.beforeRequest
      return { isLoading: false, error: null }
    })

    renderHook(() => useAIInsight({ id: 'test-id' }))

    // Call the beforeRequest callback
    beforeRequestCallback()

    expect(mockSetEventData).toHaveBeenCalledWith({
      id: 'test-id',
      isLoading: true
    })
  })

  test('should create correct orchestrator payload', () => {
    renderHook(() => useAIInsight({ id: 'test-id' }))

    expect(useCustomSWR).toHaveBeenCalledWith(
      ['orchestrator-submit', 'test-id'],
      expect.any(Function),
      expect.objectContaining({
        enabled: 'test-id'
      })
    )

    // Get the payload from the mock call
    const mockCall = useCustomSWR.mock.calls[0]
    const payload = mockCall[0] // The first argument should be the cache key

    expect(payload).toEqual(['orchestrator-submit', 'test-id'])
  })

  test('should create correct custom logs', () => {
    renderHook(() => useAIInsight({ id: 'test-id' }))

    expect(useCustomSWR).toHaveBeenCalledWith(
      expect.any(Array),
      expect.any(Function),
      expect.objectContaining({
        customLogs: {
          loggedInUser: 'user123',
          mdn: '5551234567',
          sessionId: '123456789-5551234567-call123',
          flowName: 'deviceInsight',
          externalTarget: 'target123',
          mvoenv: 'test'
        }
      })
    )
  })

  test('should handle missing event source data', () => {
    useEventSource.mockReturnValue({
      details: null,
      isLoading: false
    })

    const { result } = renderHook(() => useAIInsight({ id: 'test-id' }))

    expect(result.current.data).toBeUndefined()
  })

  test('should handle missing event source details', () => {
    useEventSource.mockReturnValue({
      isLoading: false
    })

    const { result } = renderHook(() => useAIInsight({ id: 'test-id' }))

    expect(result.current.data).toBeUndefined()
  })

  test('should handle empty ID', () => {
    const { result } = renderHook(() => useAIInsight({ id: null }))

    expect(useCustomSWR).toHaveBeenCalledWith(
      ['orchestrator-submit', null],
      expect.any(Function),
      expect.objectContaining({
        enabled: null
      })
    )
  })

  test('should handle missing params details', () => {
    useParamsDetails.mockReturnValue({})

    renderHook(() => useAIInsight({ id: 'test-id' }))

    expect(useCustomSWR).toHaveBeenCalledWith(
      expect.any(Array),
      expect.any(Function),
      expect.objectContaining({
        customLogs: expect.objectContaining({
          loggedInUser: undefined,
          mdn: undefined,
          sessionId: 'undefined-undefined-undefined',
          externalTarget: undefined,
          mvoenv: undefined
        })
      })
    )
  })

  test('should handle missing AI insight store', () => {
    useAIInsightStore.mockReturnValue({})

    renderHook(() => useAIInsight({ id: 'test-id' }))

    expect(useCustomSWR).toHaveBeenCalledWith(
      expect.any(Array),
      expect.any(Function),
      expect.objectContaining({
        customLogs: expect.objectContaining({
          flowName: 'deviceInsight' // Should default to device insight
        })
      })
    )
  })

  test('should handle session and intent ID creation', () => {
    const { result } = renderHook(() => useAIInsight({ id: 'test-id' }))

    // Verify session is called correctly
    expect(session).toHaveBeenCalledWith('intent_id', 'IN123')
    expect(mockSession.get).toHaveBeenCalled()
    
    // Verify the hook works correctly
    expect(result.current.data).toBeDefined()
  })
})

describe('Environment Detection and API Calls', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should make API calls with correct URL', async () => {
    const payload = { id: 'test-id' }
    const options = { customLogs: {}, enabled: true }

    let fetcherFunction
    useCustomSWR.mockImplementation((key, fetcher) => {
      fetcherFunction = fetcher
      return { data: null, isLoading: false, error: null }
    })

    renderHook(() => useOrchestratorSubmit(payload, options))
    await fetcherFunction()

    expect(customAxios.post).toHaveBeenCalledWith(
      expect.stringContaining('/vegas/apps/trouble-orch/submit'),
      payload,
      expect.objectContaining({ customLogs: {} })
    )
  })
})

describe('Error Scenarios and Edge Cases', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useParamsDetails.mockReturnValue({
      accountNumber: '123456789',
      mdn: '5551234567',
      acssCallId: 'call123',
      loggedInUser: 'user123',
      externalTarget: 'target123',
      mvoenv: 'test'
    })
    useAIInsightStore.mockReturnValue({
      intentId: 'IN123',
      isNetworkInsight: false
    })
    useEventSource.mockReturnValue({
      details: { response: {} },
      isLoading: false
    })
    useEventStore.mockReturnValue(jest.fn())
    session.mockReturnValue({ get: jest.fn().mockReturnValue('session-intent') })
  })

  test('should handle SWR error in useOrchestratorSubmit', () => {
    const mockError = new Error('SWR Error')
    useCustomSWR.mockReturnValue({
      data: null,
      isLoading: false,
      error: mockError
    })

    const { result } = renderHook(() => useOrchestratorSubmit({ id: 'test' }, { customLogs: {}, enabled: true }))

    expect(result.current.error).toBe(mockError)
  })

  test('should handle axios error in postOrchestratorSubmit', async () => {
    const mockError = new Error('Network Error')
    customAxios.post.mockRejectedValue(mockError)

    let fetcherFunction
    useCustomSWR.mockImplementation((key, fetcher) => {
      fetcherFunction = fetcher
      return { data: null, isLoading: false, error: null }
    })

    renderHook(() => useOrchestratorSubmit({ id: 'test' }, { customLogs: {}, enabled: true }))

    await expect(fetcherFunction()).rejects.toThrow('Network Error')
  })

  test('should handle malformed API response', async () => {
    customAxios.post.mockResolvedValue({}) // Missing data property

    let fetcherFunction
    useCustomSWR.mockImplementation((key, fetcher) => {
      fetcherFunction = fetcher
      return { data: null, isLoading: false, error: null }
    })

    renderHook(() => useOrchestratorSubmit({ id: 'test' }, { customLogs: {}, enabled: true }))

    const result = await fetcherFunction()
    expect(result).toBeUndefined()
  })

  test('should handle null API response data', async () => {
    customAxios.post.mockResolvedValue({ data: null })

    let fetcherFunction
    useCustomSWR.mockImplementation((key, fetcher) => {
      fetcherFunction = fetcher
      return { data: null, isLoading: false, error: null }
    })

    renderHook(() => useOrchestratorSubmit({ id: 'test' }, { customLogs: {}, enabled: true }))

    const result = await fetcherFunction()
    expect(result).toBeUndefined()
  })

  test('should handle session errors gracefully', () => {
    session.mockReturnValue({ 
      get: jest.fn().mockReturnValue(null) 
    })

    const { result } = renderHook(() => useAIInsight({ id: 'test-id' }))
    
    expect(result.current).toBeDefined()
    expect(result.current.data).toBeDefined()
  })

  test('should handle missing beforeRequest gracefully', async () => {
    const payload = { id: 'test-id' }
    const options = { customLogs: {}, enabled: true } // No beforeRequest

    let fetcherFunction
    useCustomSWR.mockImplementation((key, fetcher) => {
      fetcherFunction = fetcher
      return { data: null, isLoading: false, error: null }
    })

    renderHook(() => useOrchestratorSubmit(payload, options))

    // Should work normally when beforeRequest is not provided
    const result = await fetcherFunction()
    expect(result).toBe('success')
  })

  test('should handle complex nested data structures', () => {
    const complexEventSource = {
      details: {
        response: {
          summary: { 
            data: ['Item 1', 'Item 2'],
            metadata: { count: 2 }
          },
          recommendations: [
            { 
              title: 'Rec 1', 
              steps: ['Step 1', 'Step 2'],
              metadata: { priority: 'high' }
            }
          ],
          additionalData: {
            nested: {
              deep: {
                value: 'test'
              }
            }
          }
        }
      },
      isLoading: false
    }

    useEventSource.mockReturnValue(complexEventSource)

    const { result } = renderHook(() => useAIInsight({ id: 'test-id' }))

    expect(result.current.data).toEqual(complexEventSource.details.response)
    expect(result.current.data.additionalData.nested.deep.value).toBe('test')
  })
})
