import { renderHook } from '@testing-library/react';
import { useAllJourney, invalidateAllJourney } from '../useAllJournery';

// Mock the dependencies
jest.mock('@/helpers/get-query-client', () => ({
  getQueryClient: jest.fn(() => ({
    invalidateQueries: jest.fn(),
  })),
}));

jest.mock('@/servicelibs/getAllJourneyDetails', () => ({
  getAllJourneyQuery: jest.fn((payload) => ({ queryKey: ['allJourney', payload], queryFn: jest.fn() })),
  ALL_JOURNEY_KEY: 'allJourney',
}));

jest.mock('@tanstack/react-query', () => ({
  useSuspenseQuery: jest.fn(),
}));

describe('useAllJourney', () => {
  it('calls useSuspenseQuery with the correct query', () => {
    const { getAllJourneyQuery } = require('@/servicelibs/getAllJourneyDetails');
    const { useSuspenseQuery } = require('@tanstack/react-query');

    // Optionally, set a mock return value
    useSuspenseQuery.mockReturnValue({ data: 'mockData' });

    const payload = { someKey: 'someValue' };
    const { result } = renderHook(() => useAllJourney(payload));

    expect(getAllJourneyQuery).toHaveBeenCalledWith(payload);
    expect(useSuspenseQuery).toHaveBeenCalledWith(getAllJourneyQuery(payload));
    expect(result.current).toEqual({ data: 'mockData' });
  });
});

describe('invalidateAllJourney', () => {
  it('invalidates the correct query', () => {
    const { getQueryClient } = require('@/helpers/get-query-client');
    const { ALL_JOURNEY_KEY } = require('@/servicelibs/getAllJourneyDetails');

    invalidateAllJourney();

    expect(getQueryClient().invalidateQueries).toHaveBeenCalledWith({
      queryKey: [ALL_JOURNEY_KEY],
      exact: true,
    });
  });
}); 
