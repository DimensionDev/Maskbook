import { useCallback, useMemo, useState } from 'react'
import type { TransactionConfig } from 'web3-core'
import stringify from 'json-stable-stringify'
import { useAccount } from '../../../../web3/hooks/useAccount'
import { useChainId } from '../../../../web3/hooks/useChainState'
import { TransactionState, TransactionStateType } from '../../../../web3/hooks/useTransactionState'
import type { SwapResponse, TradeComputed } from '../../types'
import type { ExchangeProxy } from '../../../../contracts/ExchangeProxy'
import { SLIPPAGE_TOLERANCE_DEFAULT } from '../../constants'

export function useTradeCallback(
    trade: TradeComputed<SwapResponse> | null,
    exchangeProxyContract: ExchangeProxy | null,
    allowedSlippage = SLIPPAGE_TOLERANCE_DEFAULT,
) {
    const account = useAccount()
    const chainId = useChainId()

    // compose transaction config
    const config = useMemo(() => {
        return {
            from: account,
        } as TransactionConfig
    }, [account])

    const [tradeState, setTradeState] = useState<TransactionState>({
        type: TransactionStateType.UNKNOWN,
    })

    const tradeCallback = useCallback(async () => {
        if (!trade || !exchangeProxyContract) {
            setTradeState({
                type: TransactionStateType.UNKNOWN,
            })
            return
        }

        // pre-step: start waiting for provider to confirm tx
        setTradeState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        const {
            swaps: [swaps, tradeAmount, spotPrice],
        } = trade.trade_ as SwapResponse

        console.log('DEBUG: use trade callback')
        console.log({
            swaps,
            tradeAmount,
            spotPrice,
        })

        setTimeout(() => {
            setTradeState({
                type: TransactionStateType.FAILED,
                error: new Error('To be implemented!'),
            })
        }, 5000)
    }, [trade, exchangeProxyContract])

    const resetCallback = useCallback(() => {
        setTradeState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [tradeState, tradeCallback, resetCallback] as const
}
