'use client';

import {
  updatePortInJourney,
  UpdateJourneyPayload,
} from '@/servicelibs/journeyDetails';
import { useMutation } from '@tanstack/react-query';

export const useUpdatePortInJourney = () => {
  return useMutation({
    mutationFn: (data: UpdateJourneyPayload) => {
      return updatePortInJourney(data).then(res => {
        const [error] = res?.body?.errors || [];
        if (error) throw new Error(error.description);

        return res;
      });
    },
  });
};
