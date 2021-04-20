import { formatBalance } from '../../Wallet/formatter'
import { TradeProvider, TradeStrategy } from '../types'
import { useTradeComputed } from './useTradeComputed'
import { useTradeState } from './useTradeState'

export function useTradeStateComputed(provider: TradeProvider) {
    const tradeState = useTradeState()
    const [tradeStore, dispatchTradeStore] = tradeState

    //#region the computed trade
    const { inputAmount, outputAmount, strategy, inputToken, outputToken } = tradeStore
    const tradeComputed = useTradeComputed(provider, strategy, inputAmount, outputAmount, inputToken, outputToken)
    const { value: tradeComputed_ } = tradeComputed
    //#endregion

    debugger
    return {
        tradeState: [
            {
                ...tradeStore,
                inputAmount:
                    strategy === TradeStrategy.ExactIn
                        ? inputAmount
                        : tradeComputed_
                        ? formatBalance(tradeComputed_.inputAmount.toFixed(), inputToken?.decimals)
                        : '',
                outputAmount:
                    strategy === TradeStrategy.ExactOut
                        ? outputAmount
                        : tradeComputed_
                        ? formatBalance(tradeComputed_.outputAmount.toFixed(), outputToken?.decimals)
                        : '',
            },
            dispatchTradeStore,
        ] as const,
        tradeComputed,
    }
}
