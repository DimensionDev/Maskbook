import { EMPTY_LIST } from '@masknet/shared-base'
import { EVMNetworkResolver } from '@masknet/web3-providers'
import { RedPacketStatus, type RedPacketJSONPayload } from '@masknet/web3-providers/types'
import { isSameAddress } from '@masknet/web3-shared-base'
import { ChainId, type NetworkType } from '@masknet/web3-shared-evm'
import type { QueryObserverResult, RefetchOptions } from '@tanstack/react-query'
import { compact } from 'lodash-es'
import { useCallback } from 'react'
import { useAvailability } from './useAvailability.js'
import { useClaimStrategyStatus } from './useClaimStrategyStatus.js'
import { useSignedMessage } from './useSignedMessage.js'
import { useParseRedPacket } from './useParseRedPacket.js'

/**
 * Fetch the red packet info from the chain
 * @param payload
 */
export function useAvailabilityComputed(account: string, payload: RedPacketJSONPayload) {
    const parsedChainId =
        (payload.token?.chainId as ChainId) ??
        EVMNetworkResolver.networkChainId((payload.network ?? '') as NetworkType) ??
        ChainId.Mainnet

    const { data: availability, refetch: recheckAvailability } = useAvailability(
        payload.rpid,
        payload.contract_version,
        {
            account,
            chainId: parsedChainId,
        },
    )
    const { data: parsed, refetch: recheckParse } = useParseRedPacket()
    const checkAvailability = recheckAvailability as (
        options?: RefetchOptions,
    ) => Promise<QueryObserverResult<typeof availability>>

    const { data: password } = useSignedMessage(account, payload)
    const { data, refetch, isFetching } = useClaimStrategyStatus(payload)

    const recheckClaimStatus = useCallback(async () => {
        const { data } = await refetch()
        return data?.data?.canClaim
    }, [refetch])

    const refresh = useCallback(() => {
        checkAvailability()
        recheckClaimStatus()
        recheckParse()
    }, [checkAvailability, recheckClaimStatus, recheckParse])

    if (!availability || (!payload.password && !data))
        return {
            availability,
            checkAvailability,
            payload,
            claimStrategyStatus: null,
            checkingClaimStatus: isFetching,
            recheckClaimStatus,
            password,
            computed: {
                canClaim: !!data?.data?.canClaim,
                canRefund: false,
                listOfStatus: EMPTY_LIST as RedPacketStatus[],
            },
        }
    const isEmpty = availability.balance === '0'
    const isExpired = availability.expired
    const isClaimed = parsed?.redpacket?.isClaimed || availability.claimed_amount !== '0'
    const isRefunded = isEmpty && availability.claimed < availability.total
    const isCreator = isSameAddress(payload?.sender.address ?? '', account)
    const isPasswordValid = !!(password && password !== 'PASSWORD INVALID')
    // For a central RedPacket, we don't need to check about if the password is valid
    const canClaimByContract = !isExpired && !isEmpty && !isClaimed
    const canClaim = payload.password ? canClaimByContract && isPasswordValid : canClaimByContract

    return {
        availability,
        checkAvailability: refresh,
        claimStrategyStatus: data?.data,
        recheckClaimStatus,
        checkingClaimStatus: isFetching,
        password,
        computed: {
            canClaim,
            canRefund: isExpired && !isEmpty && isCreator,
            canSend: !isEmpty && !isExpired && !isRefunded && isCreator,
            isPasswordValid,
            isEmpty,
            isClaimed,
            isExpired,
            isRefunded,
            listOfStatus: compact([
                isClaimed ? RedPacketStatus.claimed : undefined,
                isEmpty ? RedPacketStatus.empty : undefined,
                isRefunded ? RedPacketStatus.refunded : undefined,
                isExpired ? RedPacketStatus.expired : undefined,
            ]),
            myClaimedAmount: parsed?.redpacket?.claimedAmount,
        },
    }
}
