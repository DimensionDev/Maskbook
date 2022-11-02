import type { TradeProvider } from '@masknet/public-api'
import { useV2Trade as useUniswapV2Trade } from './useTrade.js'
import { TradeStrategy } from '../../types/index.js'
import { useTradeComputed as useUniswapTradeComputed } from './useTradeComputed.js'
import { useTradeGasLimit as useUniswapTradeGasLimit } from './useTradeGasLimit.js'
import type { Web3Helper } from '@masknet/web3-helpers'

export function useUniswapV2Like(
    tradeProviders: TradeProvider[],
    traderProvider: TradeProvider,
    inputAmount_: string,
    inputToken?: Web3Helper.FungibleTokenAll,
    outputToken?: Web3Helper.FungibleTokenAll,
) {
    const isTrader = tradeProviders.some((x) => x === traderProvider)
    const trader_ = useUniswapV2Trade(
        traderProvider,
        TradeStrategy.ExactIn,
        inputAmount_,
        '0',
        isTrader ? inputToken : undefined,
        isTrader ? outputToken : undefined,
    )
    const trader = useUniswapTradeComputed(trader_.value, inputToken, outputToken)
    const traderEstimateGas = useUniswapTradeGasLimit(trader, traderProvider)
    return { trader_, trader, traderEstimateGas }
}
