import { FungibleToken, isZero, NetworkPluginID } from '@masknet/web3-shared-base'
import { TradeStrategy } from '../../types/index.js'
import { toUniswapCurrencyAmount, toUniswapCurrency } from '../../helpers/index.js'
import { useV2BestTradeExactIn, useV2BestTradeExactOut } from './useV2BestTrade.js'
import { useV3BestTradeExactIn, useV3BestTradeExactOut } from './useV3BestTrade.js'
import type { TradeProvider } from '@masknet/public-api'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { useChainId } from '@masknet/plugin-infra/web3'

function useTrade(
    strategy: TradeStrategy = TradeStrategy.ExactIn,
    inputAmount: string,
    outputAmount: string,
    inputToken?: FungibleToken<ChainId, SchemaType.Native | SchemaType.ERC20>,
    outputToken?: FungibleToken<ChainId, SchemaType.Native | SchemaType.ERC20>,
) {
    const isExactIn = strategy === TradeStrategy.ExactIn
    const isTradable = !isZero(inputAmount) || !isZero(outputAmount)
    const isNotAvailable =
        !isTradable ||
        !inputToken ||
        !outputToken ||
        (isZero(inputAmount) && isExactIn) ||
        (isZero(outputAmount) && !isExactIn)
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const inputCurrency = toUniswapCurrency(chainId, inputToken)
    const outputCurrency = toUniswapCurrency(chainId, outputToken)
    const tradeAmount = toUniswapCurrencyAmount(
        chainId,
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
    inputToken?: FungibleToken<ChainId, SchemaType.Native | SchemaType.ERC20>,
    outputToken?: FungibleToken<ChainId, SchemaType.Native | SchemaType.ERC20>,
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
    inputToken?: FungibleToken<ChainId, SchemaType.Native | SchemaType.ERC20>,
    outputToken?: FungibleToken<ChainId, SchemaType.Native | SchemaType.ERC20>,
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
