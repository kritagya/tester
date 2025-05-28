'use client';

import { getQueryClient } from '@/helpers/get-query-client';
import {
  getAllJourneyQuery,
  ALL_JOURNEY_KEY,
} from '@/servicelibs/getAllJourneyDetails';
import { useSuspenseQuery } from '@tanstack/react-query';

export const useAllJourney = (payload: any) =>
  useSuspenseQuery(getAllJourneyQuery(payload));

export const invalidateAllJourney = () => {
  const queryClient = getQueryClient();
  queryClient.invalidateQueries({
    queryKey: [ALL_JOURNEY_KEY],
    exact: true,
  });
};
