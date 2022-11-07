import { useMemo } from 'react'
import { compact } from 'lodash-es'
import { useChainContext } from '@masknet/web3-hooks-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import type { NetworkPluginID } from '@masknet/shared-base'
import { ChainId, chainResolver } from '@masknet/web3-shared-evm'
import { NftRedPacketJSONPayload, RedPacketStatus } from '../../types.js'
import { useAvailabilityNftRedPacket } from './useAvailabilityNftRedPacket.js'

/**
 * Fetch the red packet info from the chain
 * @param payload
 */
export function useNftAvailabilityComputed(account: string, payload: NftRedPacketJSONPayload) {
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const asyncResult = useAvailabilityNftRedPacket(payload?.rpid, account, chainId)

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

        const isEmpty = availability.remaining === 0
        const isExpired = availability.expired
        const isClaimed = availability.isClaimed
        const isCreator = isSameAddress(payload?.sender.address ?? '', account)
        const parsedChainId = chainResolver.chainId(payload.network ?? '') ?? ChainId.Mainnet

        const isSameChain = parsedChainId === chainId
        const isPasswordValid = !!payload.password && payload.password !== 'PASSWORD INVALID'
        const isClaimable = !isExpired && !isEmpty && !isClaimed && isSameChain
        const isSendable = !isEmpty && !isExpired && isCreator && isSameChain
        return {
            ...asyncResult,
            computed: {
                canFetch: isSameChain,
                canClaim: isClaimable && isPasswordValid,
                canSend: isSendable,
                isPasswordValid,
                listOfStatus: compact([
                    isClaimed ? RedPacketStatus.claimed : undefined,
                    isEmpty ? RedPacketStatus.empty : undefined,
                    isExpired ? RedPacketStatus.expired : undefined,
                ]),
            },
        }
    }, [asyncResult, availability, chainId])
}
