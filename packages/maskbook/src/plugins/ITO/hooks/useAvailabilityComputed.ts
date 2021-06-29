import { useState } from 'react'
import { useInterval } from 'react-use'
import { compact } from 'lodash-es'
import { useChainId } from '@masknet/web3-shared'
import { JSON_PayloadInMask, ITO_Status } from '../types'
import { useAvailability } from './useAvailability'
import { useQualification } from './useQualification'
import { ITO_CONTRACT_BASE_TIMESTAMP } from '../constants'

export function useAvailabilityComputed(payload: JSON_PayloadInMask) {
    const chainId = useChainId()
    const asyncResult = useAvailability(payload.pid, payload.contract_address)
    const { value: qualification_start_time } = useQualification(
        payload.qualification_address,
        payload.contract_address,
    )

    //#region ticker
    const [_, setTicker] = useState(0)
    useInterval(() => setTicker((x) => x + 1), 1000)
    //#endregion

    const { value: availability } = asyncResult

    if (!availability || qualification_start_time === undefined)
        return {
            ...asyncResult,
            payload,
            computed: {
                remaining: '0',
                startTime: payload.start_time,
                canFetch: false,
                canSwap: false,
                canShare: false,
                canRefund: false,
                isUnlocked: false,
                hasLockTime: false,
                unlockTime: 0,
                listOfStatus: compact([availability?.expired ? ITO_Status.expired : undefined]) as ITO_Status[],
            },
        }

    const startTime = qualification_start_time > payload.start_time ? qualification_start_time : payload.start_time

    const isStarted = startTime < Date.now()
    const isExpired = availability.expired
    const unlockTime = Number(availability.unlock_time) * 1000
    const hasLockTime = unlockTime !== ITO_CONTRACT_BASE_TIMESTAMP
    const isCompleted = Number(availability.swapped) > 0

    return {
        ...asyncResult,
        computed: {
            remaining: availability.remaining,
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
