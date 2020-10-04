import BigNumber from 'bignumber.js'
import { compact } from 'lodash-es'
import { isSameAddress } from '../../../web3/helpers'
import { useChainId } from '../../../web3/hooks/useChainId'
import { parseChainName } from '../../../web3/pipes'
import { ChainId } from '../../../web3/types'
import { formatBalance } from '../../Wallet/formatter'
import { RedPacketJSONPayload, RedPacketStatus } from '../types'
import { useAvailabilityRetry } from './useAvailability'

/**
 * Fetch red packet info on the chain
 * @param payload
 */
export function usePayloadComputed(account: string, payload?: RedPacketJSONPayload) {
    const chainId = useChainId()
    const { value: availability, error, loading, retry } = useAvailabilityRetry(account, payload?.rpid)

    if (!availability || !payload)
        return {
            availability,
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
    const isRefunded = isEmpty && Number.parseInt(availability.claimed) < Number.parseInt(availability.total)
    const isCreator = isSameAddress(payload?.sender.address ?? '', account)
    const parsedChainId = parseChainName(payload.network ?? '') ?? ChainId.Mainnet
    return {
        availability,
        payload,
        computed: {
            tokenAmount: `${formatBalance(
                new BigNumber(availability.balance),
                payload.token?.decimals ?? 18,
                payload.token?.decimals ?? 18,
            )}`,
            tokenSymbol: `${payload.token?.symbol ?? 'ETH'}`,
            canFetch: parsedChainId === chainId,
            canClaim: !isExpired && !isEmpty && !isClaimed && parsedChainId === chainId,
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
