import { renderHook, act } from '@testing-library/react'
import { useAIInsight } from '../ai-insight-hooks'
import { useEventStore } from '../../customHooks/event-source'

jest.mock('../../customHooks/event-source', () => ({
  ...jest.requireActual('../../customHooks/event-source'),
  useEventSource: jest.fn(),
  useEventStore: jest.fn()
}))

describe('ai-insight-hooks - safe coverage test', () => {
  const aiInsightStoreMock = jest.fn()
  beforeEach(() => {
    useEventStore.mockReturnValue(aiInsightStoreMock)
  })


  test('should render hook', () => {
    const { result } = renderHook(() => useAIInsight({ id: 'evt1' }))
    expect(result.current).toBeDefined()
  })
})
