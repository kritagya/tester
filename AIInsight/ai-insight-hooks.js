import { useCustomSWR } from '../helpers/customSWR'
import customAxios from '../helpers/axios'
import { useMemo, useState } from 'react'
import { session } from '../../../helpers'
import { useParamsDetails } from '../helpers/useParamDetails'
import { useAIInsightStore } from './ai-insight-store'

const networkInsightFlowName = 'network-insight'
const deviceInsightFlowName = 'device-insight'

const isProd = window?.location?.href?.toLowerCase()?.includes('vzwcorp.com');
const vegasDomain = isProd ? 'https://vegas-llm.verizon.com' : 'https://vegas-llm-test.ebiz.verizon.com';
const orchestratorSubmit = `${vegasDomain}/vegas/apps/trouble-orch/submit`
const orchestratorStatus = `${vegasDomain}/vegas/apps/trouble-orch/status`
const orchestratorSolution = `${vegasDomain}/vegas/apps/trouble-orch/solution`
const POLLING_INTERVAL = 5000

const postOrchestratorSubmit = async (payload, { customLogs }) => {
  const { data } = await customAxios.post(orchestratorSubmit, payload, { customLogs })
  return data?.status
}

const postOrchestratorStatus = async (payload, { customLogs }) => {
  const { data } = await customAxios.post(orchestratorStatus, payload, { customLogs })
  return data?.status
}

const getNetworkInsights = async (payload, { customLogs }) => {
  const { data } = await customAxios.post(orchestratorSolution, payload, { customLogs })
  return data?.response
}

export const useOrchestratorSubmit = (payload, { customLogs, enabled }) => {
  const { session_id, mtn } = payload || {}
  const cacheKey = enabled ? ['orchestrator-submit', session_id, mtn] : null

  return useCustomSWR(cacheKey, () => postOrchestratorSubmit(payload, { customLogs }))
}

const MAX_ATTEMPTS = 12
export const useOrchestratorStatus = (payload, { enabled, customLogs }) => {
  const { session_id, intent_id } = payload || {}
  const cacheKey = enabled ? ['orchestrator-status', session_id, intent_id] : null
  const [count, setCount] = useState(0)

  return useCustomSWR(
    cacheKey,
    () => {
      if (count >= MAX_ATTEMPTS) {
        return Promise.reject(new Error('Orchestrator status polling timeout: Maximum attempts reached'))
      }

      return postOrchestratorStatus(payload, { customLogs })
    },
    {
      onSuccess: () => {
        setCount((prevCount) => prevCount + 1)
      },
      refreshInterval: (status) => {
        // Keep polling every 5 seconds if status is "processing"
        // Stop polling when status is not "processing" or data is undefined
        return status === 'processing' && count <= MAX_ATTEMPTS ? POLLING_INTERVAL : 0
      },
      onError: (error) => {
        // Reset count on error if needed
        setCount(0)
      },
    }
  )
}

export const useNetworkInsight = () => {
  const { accountNumber, mdn, acssCallId, loggedInUser, externalTarget, mvoenv } = useParamsDetails()
  const aiInsightStore = useAIInsightStore((s) => s.store)

  const { intentId, sessionId } = useMemo(() => {
    const _intentId = session('intent_id', aiInsightStore?.intentId).get()
    const _sessionId = `${accountNumber}-${mdn}-${acssCallId}`
    return { intentId: _intentId, sessionId: !accountNumber ? undefined : _sessionId }
  }, [accountNumber, mdn, acssCallId, aiInsightStore?.intentId])

  const customLogs = {
    loggedInUser,
    mdn,
    sessionId,
    flowName: aiInsightStore?.isNetworkInsight ? networkInsightFlowName : deviceInsightFlowName,
    externalTarget,
    mvoenv,
  }

  // fire and forget
  const { data: submitData } = useOrchestratorSubmit(
    {
      session_id: sessionId,
      account_number: accountNumber,
      mtn: mdn,
      channel: 'ACSS',
    },
    { customLogs, enabled: !!sessionId }
  )

  // poll for status
  const { data: status, error: statusError } = useOrchestratorStatus(
    {
      session_id: sessionId,
      intent_id: intentId,
    },
    {
      enabled: submitData === 'Acknowledged',
      customLogs,
    }
  )

  const shouldFetch = !!status && status !== 'processing'
  const cacheKey = shouldFetch ? ['network-insights', sessionId, mdn, intentId] : null

  const networkInsights = useCustomSWR(cacheKey, () =>
    getNetworkInsights(
      {
        session_id: sessionId,
        intent_id: intentId,
        status: 'COMPLETED',
      },
      { customLogs }
    )
  )

  return {
    ...networkInsights,
    isLoading: networkInsights?.isLoading || !networkInsights?.data,
    error: statusError || networkInsights?.error,
  }
}

export const useNetworkInsightsOnError = () => {
  const { error, mutate: trigger } = useNetworkInsight()

  useEffect(() => {
    if (error) trigger()
  }, [error, trigger])

  return null
}
