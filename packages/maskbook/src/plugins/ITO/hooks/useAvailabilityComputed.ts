import { compact } from 'lodash-es'
import { useChainId } from '../../../web3/hooks/useChainState'
import { ITO_JSONPayload, ITO_Status } from '../types'
import { useAvailability } from './useAvailability'

/**
 * Fetch the red packet info from the chain
 * @param payload
 */
export function useAvailabilityComputed(payload: ITO_JSONPayload) {
    const chainId = useChainId()
    const asyncResult = useAvailability(payload?.pid)

    const { value: availability } = asyncResult
    console.log('v', availability)
    if (!availability)
        return {
            ...asyncResult,
            payload,
            computed: {
                canFetch: false,
                canClaim: false,
                canShare: false,
                canRefund: false,
                listOfStatus: [] as ITO_Status[],
            },
        }

    const isStarted = payload.start_time < new Date().getTime()
    const isExpired = availability.expired
    const isCompleted = Number(availability.claimed) > 0

    return {
        ...asyncResult,
        computed: {
            canFetch: payload.chainId === chainId,
            canClaim: isStarted && !isExpired && !isCompleted && payload.chainId === chainId && payload.password,
            canRefund: isExpired && payload.chainId === chainId,
            canShare: !isStarted,
            listOfStatus: compact([
                isStarted ? ITO_Status.started : ITO_Status.waited,
                isCompleted ? ITO_Status.completed : undefined,
                isExpired ? ITO_Status.expired : undefined,
            ]),
        },
    }
}
