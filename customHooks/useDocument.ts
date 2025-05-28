'use client';

import { getDocuments } from '@/actions/getDocuments';
import { useQuery } from '@tanstack/react-query';

export const useDocumentContent = (endPoint: string) => {
  return useQuery({
    queryKey: ['document-content', endPoint],
    queryFn: () => getDocuments(endPoint),
    enabled: false,
  });
};
