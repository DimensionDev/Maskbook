import type { FungibleTokenDetailed } from '@masknet/web3-shared-evm'
import type { TradeProvider } from '@masknet/public-api'

import { useV2Trade as useUniswapV2Trade } from './useTrade'
import { TradeStrategy } from '../../types'
import { useTradeComputed as useUniswapTradeComputed } from './useTradeComputed'
import { useTradeGasLimit as useUniswapTradeGasLimit } from './useTradeGasLimit'
export function useUniswapV2Like(
    tradeProviders: TradeProvider[],
    traderProvider: TradeProvider,
    inputAmount_: string,
    inputToken?: FungibleTokenDetailed,
    outputToken?: FungibleTokenDetailed,
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
