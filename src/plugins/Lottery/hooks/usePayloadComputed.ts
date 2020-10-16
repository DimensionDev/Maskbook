import BigNumber from 'bignumber.js'
import { compact } from 'lodash-es'
import { isSameAddress } from '../../../web3/helpers'
import { useChainId } from '../../../web3/hooks/useChainState'
import { resolveChainName } from '../../../web3/pipes'
import { EthereumTokenType } from '../../../web3/types'
import { formatBalance } from '../../Wallet/formatter'
import { LotteryJSONPayload, LotteryStatus } from '../types'
import { useAvailabilityRetry } from './useAvailability'
/**
 * Fetch the lottery info on the chain
 * @param payload
 */
export function usePayloadComputed(account: string, payload?: LotteryJSONPayload) {
    const chainId = useChainId()

    const { value: onChainInfo } = useAvailabilityRetry(account, payload?.lyid)
    if (!onChainInfo || !payload)
        return {
            onChainInfo,
            payload,
            computed: {
                canParticipate: false,
                canRefund: false,
                canDrew: false,
                listOfStatus: [] as LotteryStatus[],
            },
        }

    const [availability, basic_info, myinfo, participators, winner] = onChainInfo

    /***
     *  #######################
     *  availability:
     *  {
     *      is_finished
     *      is_expired
     *      if_draw_at_time
     *  }
     *  basic_info:
     *  {
     *      total_token: string
            total_winner: string
            draw_at_time: string
            draw_at_number: string
            remaining_tokens: string
            claimed_winner: string
     *  }
        myinfo:
        {
            is_participated: boolean
            is_win: boolean
        }
     *  #######################
     */

    const isEmpty = basic_info.remaining_tokens === '0'
    const isDrew = availability.is_finished
    const isExpired = availability.is_expired
    const isParticipated = myinfo.is_participated
    const isRefunded =
        isEmpty && isDrew && Number.parseInt(basic_info.claimed_winner) < Number.parseInt(basic_info.total_winner)
    const isCreator = isSameAddress(payload?.sender.address ?? '', account)
    const isWon = isDrew && isParticipated && myinfo.is_win
    const isNotWon = isDrew && isParticipated && !myinfo.is_win

    return {
        availability,
        payload,
        computed: {
            tokenAmount:
                payload.token_type === EthereumTokenType.Ether
                    ? formatBalance(new BigNumber(basic_info.remaining_tokens), 18, 18)
                    : payload.token
                    ? formatBalance(
                          new BigNumber(basic_info.remaining_tokens),
                          payload.token.decimals,
                          payload.token.decimals,
                      )
                    : '-',
            tokenSymbol: payload.token_type === EthereumTokenType.Ether ? 'ETH' : payload.token?.symbol ?? '-',
            participator: participators ?? [],
            winner: winner ?? [],
            canFetch: payload.network === resolveChainName(chainId),
            canParticipate:
                !isDrew && !isExpired && !isEmpty && !isParticipated && payload.network === resolveChainName(chainId),
            canDraw:
                (!isDrew && isExpired) ||
                (!isDrew &&
                    !availability.if_draw_at_time &&
                    participators.length >= Number.parseInt(basic_info.draw_at_number)),
            canRefund:
                (isDrew || (isExpired && participators.length === 0)) &&
                !isEmpty &&
                isCreator &&
                payload.network === resolveChainName(chainId),
            listOfStatus: compact([
                isParticipated ? LotteryStatus.participated : undefined,
                isDrew ? LotteryStatus.drew : undefined,
                isRefunded ? LotteryStatus.refunded : undefined,
                isExpired ? LotteryStatus.expired : undefined,
                isWon ? LotteryStatus.won : undefined,
                isNotWon ? LotteryStatus.notWon : undefined,
            ]),
        },
    }
}
