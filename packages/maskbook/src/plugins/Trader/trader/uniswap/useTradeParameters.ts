import { useMemo } from 'react'
import JSBI from 'jsbi'
import { Percent, TradeType, Currency } from '@uniswap/sdk-core'
import { Router, Trade } from '@uniswap/v2-sdk'
import { SLIPPAGE_TOLERANCE_DEFAULT, DEFAULT_TRANSACTION_DEADLINE } from '../../constants'
import { useAccount } from '@masknet/web3-shared'
import type { TradeComputed } from '../../types'

const UNISWAP_BIPS_BASE = JSBI.BigInt(10_000)

/**
 * Returns the swap calls that can be used to make the trade
 * @param trade trade to execute
 * @param allowedSlippage user allowed slippage
 * @param deadline the deadline for the trade
 */
export function useSwapParameters(
    trade: TradeComputed<Trade<Currency, Currency, TradeType>> | null, // trade to execute, required
    allowedSlippage: number = SLIPPAGE_TOLERANCE_DEFAULT, // in bips
    deadline: number = DEFAULT_TRANSACTION_DEADLINE, // in seconds from now
) {
    const account = useAccount()
    return useMemo(() => {
        if (!trade?.trade_ || !account) return []
        const { trade_ } = trade
        const allowedSlippage_ = new Percent(JSBI.BigInt(allowedSlippage), UNISWAP_BIPS_BASE)
        const parameters = [
            Router.swapCallParameters(trade_, {
                feeOnTransfer: false,
                allowedSlippage: allowedSlippage_,
                recipient: account,
                ttl: deadline,
            }),
        ]
        if (trade_.tradeType === TradeType.EXACT_INPUT)
            parameters.push(
                Router.swapCallParameters(trade_, {
                    feeOnTransfer: true,
                    allowedSlippage: allowedSlippage_,
                    recipient: account,
                    ttl: deadline,
                }),
            )
        return parameters
    }, [account, allowedSlippage, deadline, trade])
}
