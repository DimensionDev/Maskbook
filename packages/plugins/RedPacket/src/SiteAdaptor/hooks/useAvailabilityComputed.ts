import { EVMNetworkResolver } from '@masknet/web3-providers'
import { RedPacketStatus, type RedPacketJSONPayload } from '@masknet/web3-providers/types'
import { isSameAddress } from '@masknet/web3-shared-base'
import { ChainId, type NetworkType } from '@masknet/web3-shared-evm'
import { compact } from 'lodash-es'
import { useAvailability } from './useAvailability.js'
import { useClaimStrategyStatus } from './useClaimStrategyStatus.js'
import { useSignedMessage } from './useSignedMessage.js'
import { useCallback } from 'react'

/**
 * Fetch the red packet info from the chain
 * @param payload
 */
export function useAvailabilityComputed(account: string, payload: RedPacketJSONPayload) {
    const parsedChainId =
        payload.token?.chainId ??
        EVMNetworkResolver.networkChainId((payload.network ?? '') as NetworkType) ??
        ChainId.Mainnet

    const asyncResult = useAvailability(payload.rpid, payload.contract_address, payload.contract_version, {
        account,
        chainId: parsedChainId,
    })

    const { data: password } = useSignedMessage(account, payload)
    const { data, refetch, isFetching } = useClaimStrategyStatus(payload)

    const recheckClaimStatus = useCallback(async () => {
        const { data } = await refetch()
        return data?.data.canClaim
    }, [refetch])

    const availability = asyncResult.value

    if (!availability || (!payload.password && !data))
        return {
            ...asyncResult,
            payload,
            claimStrategyStatus: null,
            checkingClaimStatus: isFetching,
            recheckClaimStatus,
            computed: {
                canClaim: false || data?.data.canClaim,
                canRefund: false,
                listOfStatus: [] as RedPacketStatus[],
            },
        }
    const isEmpty = availability.balance === '0'
    const isExpired = availability.expired
    const isClaimed = availability.claimed_amount !== '0'
    const isRefunded = isEmpty && availability.claimed < availability.total
    const isCreator = isSameAddress(payload?.sender.address ?? '', account)
    const isPasswordValid = !!(password && password !== 'PASSWORD INVALID')
    // For a central RedPacket, we don't need to check about if the password is valid
    const canClaimByContract = !isExpired && !isEmpty && !isClaimed
    const canClaim = payload.password ? canClaimByContract && isPasswordValid : canClaimByContract
    return {
        ...asyncResult,
        claimStrategyStatus: data?.data,
        recheckClaimStatus,
        checkingClaimStatus: isFetching,
        computed: {
            canClaim: canClaim,
            canRefund: isExpired && !isEmpty && isCreator,
            canSend: !isEmpty && !isExpired && !isRefunded && isCreator,
            isPasswordValid,
            listOfStatus: compact([
                isClaimed ? RedPacketStatus.claimed : undefined,
                isEmpty ? RedPacketStatus.empty : undefined,
                isRefunded ? RedPacketStatus.refunded : undefined,
                isExpired ? RedPacketStatus.expired : undefined,
            ]),
        },
    }
}
