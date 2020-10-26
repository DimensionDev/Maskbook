import { useMemo } from 'react'
import { Trade, Router, Percent, JSBI, TradeType } from '@uniswap/sdk'
import { DEFAULT_SLIPPAGE_TOLERANCE, DEFAULT_TRANSACTION_DEADLINE, BIPS_BASE } from '../constants'
import { useAccount } from '../../../web3/hooks/useAccount'

/**
 * Returns the swap calls that can be used to make the trade
 * @param trade trade to execute
 * @param allowedSlippage user allowed slippage
 * @param deadline the deadline for the trade
 */
export function useSwapParameters(
    trade: Trade | null, // trade to execute, required
    allowedSlippage: number = DEFAULT_SLIPPAGE_TOLERANCE, // in bips
    deadline: number = DEFAULT_TRANSACTION_DEADLINE, // in seconds from now
) {
    const account = useAccount()
    return useMemo(() => {
        if (!trade || !account) return []
        const calls = [
            Router.swapCallParameters(trade, {
                feeOnTransfer: false,
                allowedSlippage: new Percent(JSBI.BigInt(allowedSlippage), BIPS_BASE),
                recipient: account,
                ttl: deadline,
            }),
        ]
        if (trade.tradeType === TradeType.EXACT_INPUT)
            calls.push(
                Router.swapCallParameters(trade, {
                    feeOnTransfer: true,
                    allowedSlippage: new Percent(JSBI.BigInt(allowedSlippage), BIPS_BASE),
                    recipient: account,
                    ttl: deadline,
                }),
            )
        return calls
    }, [account, allowedSlippage, deadline, trade])
}
