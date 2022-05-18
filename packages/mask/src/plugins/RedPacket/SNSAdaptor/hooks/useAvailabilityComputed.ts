import { compact } from 'lodash-unified'
import { useChainId } from '@masknet/plugin-infra/web3'
import { NetworkPluginID, isSameAddress } from '@masknet/web3-shared-base'
import { ChainId, chainResolver } from '@masknet/web3-shared-evm'
import { RedPacketJSONPayload, RedPacketStatus, RedPacketAvailability } from '../../types'
import { useAvailability } from './useAvailability'

/**
 * Fetch the red packet info from the chain
 * @param payload
 */
export function useAvailabilityComputed(account: string, payload: RedPacketJSONPayload) {
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const parsedChainId = chainResolver.chainId(payload.network ?? '') ?? ChainId.Mainnet
    const asyncResult = useAvailability(payload.rpid, payload.contract_version, {
        account: account,
        chainId: parsedChainId
    })

    const result = asyncResult
    const availability = result.value as RedPacketAvailability

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
    const isClaimed = availability.claimed_amount ? availability.claimed_amount !== '0' : availability.ifclaimed
    const isRefunded = isEmpty && Number.parseInt(availability.claimed, 10) < Number.parseInt(availability.total, 10)
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
