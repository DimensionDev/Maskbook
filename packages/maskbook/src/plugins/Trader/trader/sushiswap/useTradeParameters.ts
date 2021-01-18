import { useMemo } from 'react'
import { Trade, Router, Percent, JSBI, TradeType } from '@uniswap/sdk'
import { SLIPPAGE_TOLERANCE_DEFAULT, UNISWAP_BIPS_BASE, UNISWAP_DEFAULT_TRANSACTION_DEADLINE } from '../../constants'
import { useAccount } from '../../../../web3/hooks/useAccount'
import type { TradeComputed } from '../../types'

/**
 * Returns the swap calls that can be used to make the trade
 * @param trade trade to execute
 * @param allowedSlippage user allowed slippage
 * @param deadline the deadline for the trade
 */
export function useSwapParameters(
    trade: TradeComputed<Trade> | null, // trade to execute, required
    allowedSlippage: number = SLIPPAGE_TOLERANCE_DEFAULT, // in bips
    deadline: number = UNISWAP_DEFAULT_TRANSACTION_DEADLINE, // in seconds from now
) {
    const account = useAccount()
    return useMemo(() => {
        if (!trade?.trade_ || !account) return []
        const { trade_ } = trade
        const calls = [
            Router.swapCallParameters(trade_, {
                feeOnTransfer: false,
                allowedSlippage: new Percent(JSBI.BigInt(allowedSlippage), UNISWAP_BIPS_BASE),
                recipient: account,
                ttl: deadline,
            }),
        ]
        if (trade_.tradeType === TradeType.EXACT_INPUT)
            calls.push(
                Router.swapCallParameters(trade_, {
                    feeOnTransfer: true,
                    allowedSlippage: new Percent(JSBI.BigInt(allowedSlippage), UNISWAP_BIPS_BASE),
                    recipient: account,
                    ttl: deadline,
                }),
            )
        return calls
    }, [account, allowedSlippage, deadline, trade])
}
