import { compact } from 'lodash-es'
import { useChainId } from '../../../web3/hooks/useChainId'
import { JSON_PayloadInMask, ITO_Status } from '../types'
import { useAvailability } from './useAvailability'
import { useQualification } from './useQualification'
import { ITO_CONTRACT_BASE_TIMESTAMP } from '../constants'

export function useAvailabilityComputed(payload: JSON_PayloadInMask) {
    const chainId = useChainId()
    const asyncResult = useAvailability(payload?.pid)
    const { value: qualification_start_time } = useQualification(payload.qualification_address)
    const { value: availability } = asyncResult

    if (!availability || qualification_start_time === undefined)
        return {
            ...asyncResult,
            payload,
            computed: {
                startTime: payload.start_time * 1000,
                canFetch: false,
                canSwap: false,
                canShare: false,
                canRefund: false,
                isUnlocked: false,
                hasLockTime: false,
                unlockTime: 0,
                listOfStatus: [] as ITO_Status[],
            },
        }

    const startTime =
        qualification_start_time > payload.start_time * 1000 ? qualification_start_time : payload.start_time * 1000

    const isStarted = startTime < Date.now()
    const isExpired = availability.expired
    const unlockTime = Number(availability.unlock_time) * 1000
    const hasLockTime = unlockTime !== ITO_CONTRACT_BASE_TIMESTAMP
    const isCompleted = Number(availability.swapped) > 0

    return {
        ...asyncResult,
        computed: {
            startTime,
            unlockTime,
            hasLockTime,
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
