'use client';

import {
    getSupportCaseDetailsQueryKey,
  supportCaseDetailsQuery,
} from '@/servicelibs/supportCaseDetails';
import { IJourneyDetailsResponse } from '@/types/JourneyDetails.types';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';

type UseGetJourneyProps = {
  journeyType: string;
};

export const useGetSupportCaseDetails = ({
  journeyType,
}: UseGetJourneyProps) => {
  const { journeyKey } = useParams();
  const queryClient = useQueryClient();
  const queryKey = getSupportCaseDetailsQueryKey({
    journeyKey: journeyKey as string,
    journeyType,
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
    supportCaseDetailsQuery({
      journeyKey: journeyKey as string,
      journeyType,
    })
  );

  return { ...query, mutate, invalidate };
};

export const useSupportCaseDetails = (journeyType?: string) => {
  return useGetSupportCaseDetails({
    journeyType: journeyType as string,
  });
};
