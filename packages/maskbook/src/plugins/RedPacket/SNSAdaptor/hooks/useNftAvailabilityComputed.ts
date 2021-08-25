import { useMemo } from 'react'
import { compact } from 'lodash-es'
import { isSameAddress, useChainId, getChainIdFromName, ChainId } from '@masknet/web3-shared'
import { NftRedPacketJSONPayload, RedPacketStatus } from '../../types'
import { useAvailabilityNftRedPacket } from './useAvailabilityNftRedPacket'

/**
 * Fetch the red packet info from the chain
 * @param payload
 */
export function useNftAvailabilityComputed(account: string, payload: NftRedPacketJSONPayload) {
    const chainId = useChainId()
    const asyncResult = useAvailabilityNftRedPacket(payload?.rpid, account)

    const result = asyncResult
    const availability = result.value

    return useMemo(() => {
        if (!availability) {
            return {
                ...asyncResult,
                payload,
                computed: {
                    canClaim: false,
                    listOfStatus: [] as RedPacketStatus[],
                },
            }
        }

        const isEmpty = availability.balance === '0'
        const isExpired = availability.expired
        const isClaimed = availability.isClaimed
        const isCreator = isSameAddress(payload?.sender.address ?? '', account)
        const parsedChainId = getChainIdFromName(payload.network ?? '') ?? ChainId.Mainnet
        return {
            ...asyncResult,
            computed: {
                canFetch: parsedChainId === chainId,
                canClaim: !isExpired && !isEmpty && !isClaimed && parsedChainId === chainId && payload.password,
                canSend: !isEmpty && !isExpired && isCreator && parsedChainId === chainId,
                listOfStatus: compact([
                    isClaimed ? RedPacketStatus.claimed : undefined,
                    isEmpty ? RedPacketStatus.empty : undefined,
                    isExpired ? RedPacketStatus.expired : undefined,
                ]),
            },
        }
    }, [asyncResult, availability, chainId])
}
