'use client';

import { userInfoQuery } from '@/servicelibs/userInfo';
import { useSuspenseQuery } from '@tanstack/react-query';

export const useUserInfo = () => useSuspenseQuery(userInfoQuery);
