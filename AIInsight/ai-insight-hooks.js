import { useCustomSWR } from '../helpers/customSWR'
import customAxios from '../helpers/axios'
import { useMemo } from 'react'
import { session } from '../../../helpers'
import { useParamsDetails } from '../helpers/useParamDetails'
import { useAIInsightStore } from './ai-insight-store'
import { useEventSource, useEventStore } from '../customHooks/event-source'

const networkInsightFlowName = 'networkInsight'
const deviceInsightFlowName = 'deviceInsight'

const isProd = window?.location?.href?.toLowerCase()?.includes('vzwcorp.com');
const vegasDomain = isProd ? 'https://vegas-llm.verizon.com' : 'https://vegas-llm-test.ebiz.verizon.com';
const orchestratorSubmit = `${vegasDomain}/vegas/apps/trouble-orch/submit`
const postOrchestratorSubmit = async (payload, { customLogs }) => {
  const { data } = await customAxios.post(orchestratorSubmit, payload, { customLogs })
  return data?.status
}



export const useOrchestratorSubmit = (payload, { customLogs, beforeRequest, enabled, ...swrOptions }) => {
  const { id } = payload || {}
  const cacheKey = enabled ? ['orchestrator-submit', id] : null

  return useCustomSWR(
    cacheKey,
    () => {
      if (beforeRequest) beforeRequest()
      return postOrchestratorSubmit(payload, { customLogs })
    },
    swrOptions
  )
}

export const useAIInsight = ({ id }) => {
  const { accountNumber, mdn, acssCallId, loggedInUser, externalTarget, mvoenv } = useParamsDetails()
  const aiInsightStore = useAIInsightStore((s) => s.store)
  const setEventData = useEventStore((s) => s.setEventData)
  const aiInsight = useEventSource({ id })


  const { intentId, sessionId } = useMemo(() => {
    const _intentId = session('intent_id', aiInsightStore?.intentId).get()
    const _sessionId = `${accountNumber}-${mdn}-${acssCallId}`
    return { intentId: _intentId, sessionId: _sessionId }
  }, [accountNumber, mdn, acssCallId, aiInsightStore?.intentId])

  const component_name = aiInsightStore?.isNetworkInsight ? networkInsightFlowName : deviceInsightFlowName

  const customLogs = {
    loggedInUser,
    mdn,
    sessionId,
    flowName: component_name,
    externalTarget,
    mvoenv,
  }

  // fire and forget
  const {isLoading: isSubmitting, error: submitError } = useOrchestratorSubmit(
    {
      session_id: sessionId,
      account_number: accountNumber,
      mtn: mdn,
      channel: 'ACSS',
      id,
      agent_id: loggedInUser,
      component_name,
      intent_id: intentId
    },
    {
      enabled:  id,
      customLogs,
      beforeRequest: () => {
        setEventData({ id, isLoading: true })
      }
    }
  )

  return {
    data: aiInsight?.details?.response,
    isLoading: isSubmitting || aiInsight?.isLoading,
    error: submitError,
  }
}

// export const useAIInsightsOnError = () => {
//   const { error, mutate: trigger } = useAIInsight()

//   useEffect(() => {
//     if (error) trigger()
//   }, [error, trigger])

//   return null
// }
