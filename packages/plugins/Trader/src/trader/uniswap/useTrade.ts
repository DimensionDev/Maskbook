import { isZero } from '@masknet/web3-shared-base'
import { NetworkPluginID } from '@masknet/shared-base'
import type { TradeProvider } from '@masknet/public-api'
import { useChainContext, useNetworkContext } from '@masknet/web3-hooks-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { uniswap } from '@masknet/web3-providers/helpers'
import type { ChainId } from '@masknet/web3-shared-evm'
import { useV2BestTradeExactIn, useV2BestTradeExactOut } from './useV2BestTrade.js'
import { useV3BestTradeExactIn, useV3BestTradeExactOut } from './useV3BestTrade.js'
import { TradeStrategy } from '../../types/index.js'

function useTrade(
    strategy: TradeStrategy = TradeStrategy.ExactIn,
    inputAmount: string,
    outputAmount: string,
    inputToken?: Web3Helper.FungibleTokenAll,
    outputToken?: Web3Helper.FungibleTokenAll,
) {
    const isExactIn = strategy === TradeStrategy.ExactIn
    const isTradable = !isZero(inputAmount) || !isZero(outputAmount)
    const isNotAvailable =
        !isTradable ||
        !inputToken ||
        !outputToken ||
        (isZero(inputAmount) && isExactIn) ||
        (isZero(outputAmount) && !isExactIn)
    const { chainId } = useChainContext()
    const { pluginID } = useNetworkContext()
    const inputCurrency = uniswap.toUniswapCurrency(
        pluginID === NetworkPluginID.PLUGIN_EVM ? (chainId as ChainId) : undefined,
        inputToken,
    )
    const outputCurrency = uniswap.toUniswapCurrency(
        pluginID === NetworkPluginID.PLUGIN_EVM ? (chainId as ChainId) : undefined,
        outputToken,
    )
    const tradeAmount = uniswap.toUniswapCurrencyAmount(
        pluginID === NetworkPluginID.PLUGIN_EVM ? (chainId as ChainId) : undefined,
        isExactIn ? inputToken : outputToken,
        isExactIn ? inputAmount : outputAmount,
    )
    return {
        isNotAvailable,
        isExactIn,
        tradeAmount,
        inputCurrency,
        outputCurrency,
    }
}

export function useV2Trade(
    tradeProvider: TradeProvider,
    strategy: TradeStrategy = TradeStrategy.ExactIn,
    inputAmount: string,
    outputAmount: string,
    inputToken?: Web3Helper.FungibleTokenAll,
    outputToken?: Web3Helper.FungibleTokenAll,
) {
    const { isNotAvailable, isExactIn, tradeAmount, inputCurrency, outputCurrency } = useTrade(
        strategy,
        inputAmount,
        outputAmount,
        inputToken,
        outputToken,
    )

    // #region v2
    const v2BestTradeExactIn = useV2BestTradeExactIn(tradeProvider, isExactIn ? tradeAmount : undefined, outputCurrency)
    const v2BestTradeExactOut = useV2BestTradeExactOut(
        tradeProvider,
        inputCurrency,
        !isExactIn ? tradeAmount : undefined,
    )
    // #endregion

    const v2Trade = isExactIn ? v2BestTradeExactIn : v2BestTradeExactOut

    if (isNotAvailable)
        return {
            ...v2Trade,
            error: undefined,
            loading: false,
            value: null,
        }

    return {
        ...v2Trade,
        value: v2Trade.value,
    }
}

export function useV3Trade(
    strategy: TradeStrategy = TradeStrategy.ExactIn,
    inputAmount: string,
    outputAmount: string,
    inputToken?: Web3Helper.FungibleTokenAll,
    outputToken?: Web3Helper.FungibleTokenAll,
) {
    const { isNotAvailable, isExactIn, tradeAmount, inputCurrency, outputCurrency } = useTrade(
        strategy,
        inputAmount,
        outputAmount,
        inputToken,
        outputToken,
    )

    // #region v3
    const v3BestTradeExactIn = useV3BestTradeExactIn(isExactIn ? tradeAmount : undefined, outputCurrency)
    const v3BestTradeExactOut = useV3BestTradeExactOut(inputCurrency, !isExactIn ? tradeAmount : undefined)
    // #endregion

    const v3Trade = isExactIn ? v3BestTradeExactIn : v3BestTradeExactOut

    if (isNotAvailable)
        return {
            ...v3Trade,
            error: undefined,
            loading: false,
            value: null,
        }
    return {
        ...v3Trade,
        value: v3Trade.value ?? null,
    }
}
