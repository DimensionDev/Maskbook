import { compact } from 'lodash-es'
import { isSameAddress } from '@masknet/web3-shared-base'
import { ChainId, networkResolver, type NetworkType } from '@masknet/web3-shared-evm'
import { type RedPacketJSONPayload, RedPacketStatus } from '../../types.js'
import { useAvailability } from './useAvailability.js'

/**
 * Fetch the red packet info from the chain
 * @param payload
 */
export function useAvailabilityComputed(account: string, payload: RedPacketJSONPayload) {
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
    const isCreator = isSameAddress(payload.sender.address ?? '', account)
    const isPasswordValid = !!(payload.password && payload.password !== 'PASSWORD INVALID')
    return {
        ...asyncResult,
        computed: {
            canClaim: !isExpired && !isEmpty && !isClaimed && isPasswordValid,
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
