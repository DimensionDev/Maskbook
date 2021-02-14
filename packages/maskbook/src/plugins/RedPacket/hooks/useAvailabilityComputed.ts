import { compact } from 'lodash-es'
import { isSameAddress } from '../../../web3/helpers'
import { useChainId } from '../../../web3/hooks/useChainState'
import { resolveChainId } from '../../../web3/pipes'
import { ChainId } from '../../../web3/types'
import { RedPacketJSONPayload, RedPacketStatus } from '../types'
import { useAvailability } from './useAvailability'

/**
 * Fetch the red packet info from the chain
 * @param payload
 */
export function useAvailabilityComputed(account: string, payload: RedPacketJSONPayload) {
    const chainId = useChainId()
    const asyncResult = useAvailability(account, payload?.rpid)

    const { value: availability } = asyncResult

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
    const isClaimed = availability.ifclaimed
    const isRefunded = isEmpty && Number.parseInt(availability.claimed, 10) < Number.parseInt(availability.total, 10)
    const isCreator = isSameAddress(payload?.sender.address ?? '', account)
    const parsedChainId = resolveChainId(payload.network ?? '') ?? ChainId.Mainnet
    return {
        ...asyncResult,
        computed: {
            canFetch: parsedChainId === chainId,
            canClaim: !isExpired && !isEmpty && !isClaimed && parsedChainId === chainId && payload.password,
            canRefund: isExpired && !isEmpty && isCreator && parsedChainId === chainId,
            listOfStatus: compact([
                isClaimed ? RedPacketStatus.claimed : undefined,
                isEmpty ? RedPacketStatus.empty : undefined,
                isRefunded ? RedPacketStatus.refunded : undefined,
                isExpired ? RedPacketStatus.expired : undefined,
            ]),
        },
    }
}
