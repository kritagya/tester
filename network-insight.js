import { useCustomSWR } from '../helpers/customSWR'
import { axiosPost } from '../helpers/axios'
import { useContext, useMemo } from 'react'
import { session } from '../../../helpers'
import { ParamsContext } from '../../../../../../../../IssueSelector'

const isDevelopment = process.env.NODE_ENV === 'development'
const vegasDomain = isDevelopment ? '' : 'https://vegas-llm-test.ebiz.verizon.com'
const orchestratorSubmit = `${vegasDomain}/vegas/apps/trouble-orch/submit`
const orchestratorStatus = `${vegasDomain}/vegas/apps/trouble-orch/status`
const orchestratorSolution = `${vegasDomain}/vegas/apps/trouble-orch/solution`
const POLLING_INTERVAL = 5000
const isACSS = true

const postOrchestratorSubmit = async (payload) => {
  return axiosPost(orchestratorSubmit, payload, { isACSS })
}

const postOrchestratorStatus = async (payload) => {
  const { data } = await axiosPost(orchestratorStatus, payload, { isACSS })
  return data?.status
}

const getNetworkInsights = async (payload) => {
  const { data } = await axiosPost(orchestratorSolution, payload, { isACSS })
  return data?.response
}



export const useOrchestratorSubmit = (payload) => {
  const cacheKey = ['orchestrator-submit', payload]

  return useCustomSWR(cacheKey, () => postOrchestratorSubmit(payload))
}

export const useOrchestratorStatus = (payload) => {
  const cacheKey = ['orchestrator-status', payload]

  return useCustomSWR(cacheKey, () => postOrchestratorStatus(payload), {
    refreshInterval: (status) => {
      // Keep polling every 2 seconds if status is "processing"
      // Stop polling when status is not "processing" or data is undefined
      return status === 'processing' ? POLLING_INTERVAL : 0
    },
  })
}



export const useNetworkInsight = () => {
  const { paramsDetails } = useContext(ParamsContext) || {}
  const { accountNumber, mdn, acssCallId } = paramsDetails || {}

  const { humanMessage, sessionId } = useMemo(() => {
    const defaultValue = 'call drop'
    const humanMessage = session('human_message', defaultValue).get()
    const sessionId = `${accountNumber}-${mdn}-${acssCallId}`
    return { humanMessage, sessionId }
  }, [accountNumber, mdn, acssCallId])

  // fire and forget
  useOrchestratorSubmit({
    session_id: sessionId,
    account_number: accountNumber,
    mtn: mdn,
    channel: 'ACSS',
  })

  // poll for status 
  const { data: status, error: statusError } = useOrchestratorStatus({
    session_id: sessionId,
    human_message: humanMessage
  })

  const shouldFetch = !!status && status !== 'processing'
  const cacheKey = shouldFetch ? ['network-insights', sessionId, humanMessage] : null

  const networkInsights = useCustomSWR(
    cacheKey,
    () =>
      getNetworkInsights({
        session_id: sessionId,
        human_message: humanMessage,
      }),
    {}
  )

  return {
    ...networkInsights,
    isLoading: networkInsights?.isLoading || !networkInsights?.data,
    error : statusError || networkInsights?.error
  }
}
