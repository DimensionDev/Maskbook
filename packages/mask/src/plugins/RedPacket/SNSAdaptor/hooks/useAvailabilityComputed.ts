import { compact } from 'lodash-unified'
import { useChainContext } from '@masknet/web3-hooks-base'
import type { NetworkPluginID } from '@masknet/shared-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import { ChainId, networkResolver, NetworkType } from '@masknet/web3-shared-evm'
import { RedPacketJSONPayload, RedPacketStatus } from '../../types.js'
import { useAvailability } from './useAvailability.js'

/**
 * Fetch the red packet info from the chain
 * @param payload
 */
export function useAvailabilityComputed(account: string, payload: RedPacketJSONPayload) {
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const parsedChainId =
        payload.token?.chainId ??
        networkResolver.networkChainId((payload.network ?? '') as NetworkType) ??
        ChainId.Mainnet

    const asyncResult = useAvailability(payload.rpid, payload.contract_address, payload.contract_version, {
        account,
        chainId: parsedChainId,
    })

    const result = asyncResult
    const availability = result.value

    if (!availability)
        return {
            ...asyncResult,
            payload,
            computed: {
                canClaim: false,
                canRefund: false,
                listOfStatus: [] as RedPacketStatus[],
            },
        }
    const isEmpty = availability.balance === '0'
    const isExpired = availability.expired
    const isClaimed = availability.claimed_amount !== '0'
    const isRefunded = isEmpty && availability.claimed < availability.total
    const isCreator = isSameAddress(payload?.sender.address ?? '', account)
    const isPasswordValid = Boolean(payload.password && payload.password !== 'PASSWORD INVALID')
    return {
        ...asyncResult,
        computed: {
            canFetch: parsedChainId === chainId,
            canClaim: !isExpired && !isEmpty && !isClaimed && parsedChainId === chainId && isPasswordValid,
            canRefund: isExpired && !isEmpty && isCreator && parsedChainId === chainId,
            canSend: !isEmpty && !isExpired && !isRefunded && isCreator && parsedChainId === chainId,
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
