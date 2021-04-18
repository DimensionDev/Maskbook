import { compact } from 'lodash-es'
import { useChainId } from '../../../web3/hooks/useChainState'
import { JSON_PayloadInMask, ITO_Status } from '../types'
import { useAvailability } from './useAvailability'

/**
 * Fetch the red packet info from the chain
 * @param payload
 */
export function useAvailabilityComputed(payload: JSON_PayloadInMask) {
    const chainId = useChainId()
    const asyncResult = useAvailability(payload?.pid)

    const { value: availability } = asyncResult

    const startTime =
        payload.qualification_start_time > payload.start_time * 1000
            ? payload.qualification_start_time
            : payload.start_time * 1000
    console.log('payload.qualification_start_time', payload.qualification_start_time)
    if (!availability)
        return {
            ...asyncResult,
            payload,
            computed: {
                startTime,
                canFetch: false,
                canSwap: false,
                canShare: false,
                canRefund: false,
                isUnlocked: false,
                unlockTime: 0,
                listOfStatus: [] as ITO_Status[],
            },
        }

    const isStarted = startTime < new Date().getTime()
    const isExpired = availability.expired
    const unlockTime = Number(availability.unlock_time) * 1000

    const isCompleted = Number(availability.swapped) > 0

    return {
        ...asyncResult,
        computed: {
            startTime,
            unlockTime,
            isUnlocked: availability.unlocked,
            canFetch: payload.chain_id === chainId,
            canSwap: isStarted && !isExpired && !isCompleted && payload.chain_id === chainId && payload.password,
            canRefund: isExpired && payload.chain_id === chainId,
            canShare: !isStarted,
            listOfStatus: compact([
                isStarted ? ITO_Status.started : ITO_Status.waited,
                isExpired ? ITO_Status.expired : undefined,
            ]),
        },
    }
}
