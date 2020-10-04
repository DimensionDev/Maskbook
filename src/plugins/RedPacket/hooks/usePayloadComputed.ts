import BigNumber from 'bignumber.js'
import { compact } from 'lodash-es'
import { isSameAddress } from '../../../web3/helpers'
import { useChainId } from '../../../web3/hooks/useChainId'
import { parseChainName } from '../../../web3/pipes'
import { ChainId, EthereumTokenType } from '../../../web3/types'
import { formatBalance } from '../../Wallet/formatter'
import { RedPacketJSONPayload, RedPacketStatus } from '../types'
import { useAvailabilityRetry } from './useAvailability'

/**
 * Fetch the red packet info on the chain
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
            tokenAmount:
                payload.token_type === EthereumTokenType.Ether
                    ? formatBalance(new BigNumber(availability.balance), 18, 18)
                    : payload.token
                    ? formatBalance(new BigNumber(availability.balance), payload.token.decimals, payload.token.decimals)
                    : '-',
            tokenSymbol: payload.token_type === EthereumTokenType.Ether ? 'ETH' : payload.token?.symbol ?? '-',
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
