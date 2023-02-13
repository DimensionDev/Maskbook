import { compact } from 'lodash-es'
import { useITOConstants } from '@masknet/web3-shared-evm'
import isAfter from 'date-fns/isAfter'
import { JSON_PayloadInMask, JSON_PayloadFromChain, ITO_Status } from '../../types.js'
import { useAvailability } from './useAvailability.js'
import { useQualification } from './useQualification.js'
import { ITO_CONTRACT_BASE_TIMESTAMP } from '../../constants.js'
import { useChainContext } from '@masknet/web3-hooks-base'
import type { NetworkPluginID } from '@masknet/shared-base'

export function useAvailabilityComputed(payload: JSON_PayloadInMask | JSON_PayloadFromChain) {
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { DEFAULT_QUALIFICATION2_ADDRESS } = useITOConstants(payload.chain_id ?? chainId)
    const asyncResult = useAvailability(payload.pid, payload.contract_address, {
        account: payload.seller.address,
        chainId: payload.chain_id ?? chainId,
    })
    const { value: availability, loading: loadingITO } = asyncResult
    const qualificationAddress =
        payload.qualification_address ?? availability?.qualification_addr ?? DEFAULT_QUALIFICATION2_ADDRESS
    const { value: qualification_start_time, loading: loadingQual } = useQualification(
        qualificationAddress,
        payload.contract_address,
    )
    asyncResult.loading = loadingITO || loadingQual

    if (!availability)
        return {
            ...asyncResult,
            payload,
            computed: {
                remaining: '0',
                startTime: 0,
                endTime: 0,
                canSwap: false,
                canShare: false,
                canRefund: false,
                isUnlocked: false,
                hasLockTime: false,
                unlockTime: 0,
                qualificationAddress,
                listOfStatus: compact([ITO_Status.expired]) as ITO_Status[],
            },
        }
    const _startTime =
        Number(availability.start_time) * 1000 ? Number(availability.start_time) * 1000 : payload.start_time
    const endTime = Number(availability.end_time) * 1000 ? Number(availability.end_time) * 1000 : payload.end_time
    const startTime =
        qualification_start_time && qualification_start_time > _startTime ? qualification_start_time : _startTime
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
            endTime,
            unlockTime,
            qualificationAddress,
            hasLockTime,
            isUnlocked: isAfter(Date.now(), unlockTime),
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
