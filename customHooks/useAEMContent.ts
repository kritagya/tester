'use client';

import { aemContentQuery } from '@/servicelibs/aemContent';
import { useSuspenseQuery } from '@tanstack/react-query';

export const useAEMContent = () => useSuspenseQuery(aemContentQuery);
