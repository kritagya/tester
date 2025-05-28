'use client';

import {
  getJourneyDetailsQueryKey,
  journeyDetailsQuery,
} from '@/servicelibs/journeyDetails';
import { IJourneyDetailsResponse } from '@/types/JourneyDetails.types';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';

type UseGetJourneyProps = {
  journeyType: string;
  mdn?: string;
};

export const useGetJourneyDetails = ({
  journeyType,
  mdn,
}: UseGetJourneyProps) => {
  const { journeyKey } = useParams();
  const queryClient = useQueryClient();
  const queryKey = getJourneyDetailsQueryKey({
    journeyKey: journeyKey as string,
    journeyType,
    mdn,
  });

  // set query data
  const mutate = (data: IJourneyDetailsResponse) => {
    queryClient.setQueryData(queryKey, data);
  };

  // invalidate query data
  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey,
    });
  };

  const query = useSuspenseQuery(
    journeyDetailsQuery({
      journeyKey: journeyKey as string,
      journeyType,
      mdn,
    })
  );

  return { ...query, mutate, invalidate };
};

export const useJourneyDetails = (journeyType?: string, mdn?: string) => {
  return useGetJourneyDetails({
    journeyType: journeyType as string,
    mdn,
  });
};
