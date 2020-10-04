import BigNumber from 'bignumber.js'
import { compact } from 'lodash-es'
import { useEffect } from 'react'
import { isSameAddress } from '../../../web3/helpers'
import { formatBalance } from '../../Wallet/formatter'
import { RedPacketJSONPayload, RedPacketStatus } from '../types'
import { useAvailabilityRetry } from './useAvailability'

/**
 * Fetch red packet info on the chain
 * @param payload
 */
export function usePayloadComputed(account: string, payload?: RedPacketJSONPayload) {
    const { value: availability, loading, retry } = useAvailabilityRetry(account, payload?.rpid)

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
            canClaim: !isExpired && !isEmpty && !isClaimed,
            canRefund: isExpired && !isEmpty && isCreator,
            listOfStatus: compact([
                isClaimed ? RedPacketStatus.claimed : undefined,
                isEmpty ? RedPacketStatus.empty : undefined,
                isRefunded ? RedPacketStatus.refunded : undefined,
                isExpired ? RedPacketStatus.expired : undefined,
            ]),
        },
    }
}
