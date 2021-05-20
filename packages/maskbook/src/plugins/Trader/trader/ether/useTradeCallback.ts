import { useEtherWrapperCallback } from '../../../../web3/hooks/useEtherWrapperCallback'
import { EthereumTokenType } from '../../../../web3/types'
import { TradeComputed, TradeStrategy } from '../../types'
import type { EtherWrapper } from './useTradeComputed'

export function useTradeCallback(trade: TradeComputed<EtherWrapper> | null) {
    const [transactionState, wrapCallback, unwrapCallback, resetCallback] = useEtherWrapperCallback()

    return [
        transactionState,
        async () => {
            if (!trade?.trade_?.isEtherWrapper) return
            if (!trade.inputToken || !trade.outputToken) return

            // input amount and output amount are the same value
            const tradeAmount = trade.inputAmount.toFixed()

            if (
                (trade.strategy === TradeStrategy.ExactIn && trade.inputToken.type === EthereumTokenType.Native) ||
                (trade.strategy === TradeStrategy.ExactOut && trade.outputToken.type === EthereumTokenType.Native)
            ) {
                wrapCallback(tradeAmount)
                return
            }
            unwrapCallback(false, tradeAmount)
        },
        resetCallback,
    ] as const
}
