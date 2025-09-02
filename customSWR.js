import useSWR from 'swr'

// swr defaults move to config file when implementing
const swrDefaults = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  revalidateIfStale: false,
  shouldRetryOnError: false,
}

export const useCustomSWR = (key, fetcher, options) => {
  return useSWR(key, fetcher, { ...swrDefaults, ...options })
}
