import { postHttpClientRequest } from '@vz/react-util/dist/cjs'
import { channelId } from '../../../../../../shared/utilities/channel'

export const getAxiosConfig = (isACSS) => ({
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    credentials: true,
    channelId: isACSS ? 'VZW-ACSS' : channelId,
    'x-apikey': process.env.REACT_APP_API_KEY,
  },
})

export const axiosPost = async (url, payload, config) => {
  const axiosConfig = getAxiosConfig(config?.isACSS)
  return postHttpClientRequest(url, payload, axiosConfig)
}
