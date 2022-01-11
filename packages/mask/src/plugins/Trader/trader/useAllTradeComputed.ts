import type { FungibleTokenDetailed } from '@masknet/web3-shared-evm'
import { multipliedBy, pow10 } from '@masknet/web3-shared-base'
import { useTrade as useNativeTokenTrade } from './native/useTrade'
import { useTradeComputed as useNativeTokenTradeComputed } from './native/useTradeComputed'
import { SwapOOData, TagType, TradeInfo, TradeStrategy } from '../types'
import { useV2Trade as useUniswapV2Trade, useV3Trade as useUniswapV3Trade } from './uniswap/useTrade'
import { useTradeComputed as useUniswapTradeComputed } from './uniswap/useTradeComputed'
import { useTradeGasLimit as useUniswapTradeGasLimit } from './uniswap/useTradeGasLimit'
import { useTrade as useZrxTrade } from './0x/useTrade'
import { useTradeComputed as useZrxTradeComputed } from './0x/useTradeComputed'
import { useTradeGasLimit as useZrxTradeGasLimit } from './0x/useTradeGasLimit'
import { useTrade as useBalancerTrade } from './balancer/useTrade'
import { useTradeComputed as useBalancerTradeComputed } from './balancer/useTradeComputed'
import { useTradeGasLimit as useBalancerTradeGasLimit } from './balancer/useTradeGasLimit'
import { useTrade as useDODOTrade } from './dodo/useTrade'
import { useTradeComputed as useDODOTradeComputed } from './dodo/useTradeComputed'
import { useTradeGasLimit as useDODOTradeGasLimit } from './dodo/useTradeGasLimit'
import { useTrade as useBancorTrade } from './bancor/useTrade'
import { useTradeComputed as useBancorTradeComputed } from './bancor/useTradeComputed'
import { useTradeGasLimit as useBancorTradeGasLimit } from './bancor/useTradeGasLimit'
import { useTradeComputed as useOpenOceanTradeComputed } from './openocean/useTradeComputed'
import { useTrade as useOpenOceanTrade } from './openocean/useTrade'
import { useTradeGasLimit as useOpenOceanTradeGasLimit } from './openocean/useTradeGasLimit'
import { TradeProvider } from '@masknet/public-api'
import { useAvailableTraderProviders } from '../trending/useAvailableTraderProviders'
import { useNativeTradeGasLimit } from './useNativeTradeGasLimit'
import { TargetChainIdContext } from './useTargetChainIdContext'
import type { TradeComputed } from '../types'

export function useUniswapV2Hook(
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

export function useAllTradeComputed(
    inputAmount: string,
    inputToken?: FungibleTokenDetailed,
    outputToken?: FungibleTokenDetailed,
): TradeInfo[] {
    const { targetChainId } = TargetChainIdContext.useContainer()
    const inputTokenProduct = pow10(inputToken?.decimals ?? 0)
    const inputAmount_ = multipliedBy(inputAmount || '0', inputTokenProduct)
        .integerValue()
        .toFixed()
    const { value: tradeProviders = [] } = useAvailableTraderProviders(TagType.CASH, 'MASK', targetChainId)

    // NATIVE-WNATIVE pair
    const nativeToken_ = useNativeTokenTrade(inputToken, outputToken)
    const nativeToken = useNativeTokenTradeComputed(
        nativeToken_.value ?? false,
        TradeStrategy.ExactIn,
        inputAmount_,
        '0',
        inputToken,
        outputToken,
    )

    const nativeTradeGasLimit = useNativeTradeGasLimit(nativeToken, targetChainId)

    //uniswap-v2

    const {
        trader_: uniswapV2_,
        trader: uniswapV2,
        traderEstimateGas: uniswapV2EstimateGas,
    } = useUniswapV2Hook(tradeProviders, TradeProvider.UNISWAP_V2, inputAmount_, inputToken, outputToken)

    // sushi swap
    const {
        trader_: sushiSwap_,
        trader: sushiSwap,
        traderEstimateGas: sushiSwapEstimateGas,
    } = useUniswapV2Hook(tradeProviders, TradeProvider.SUSHISWAP, inputAmount_, inputToken, outputToken)

    // sashimi swap
    const {
        trader_: sashimiSwap_,
        trader: sashimiSwap,
        traderEstimateGas: sashimiSwapEstimateGas,
    } = useUniswapV2Hook(tradeProviders, TradeProvider.SASHIMISWAP, inputAmount_, inputToken, outputToken)

    // quick swap
    const {
        trader_: quickSwap_,
        trader: quickSwap,
        traderEstimateGas: quickSwapEstimateGas,
    } = useUniswapV2Hook(tradeProviders, TradeProvider.QUICKSWAP, inputAmount_, inputToken, outputToken)

    // pancake swap
    const {
        trader_: pancakeSwap_,
        trader: pancakeSwap,
        traderEstimateGas: pancakeSwapEstimateGas,
    } = useUniswapV2Hook(tradeProviders, TradeProvider.PANCAKESWAP, inputAmount_, inputToken, outputToken)

    // uniswap-v3 like providers
    const uniswapV3_ = useUniswapV3Trade(
        TradeStrategy.ExactIn,
        inputAmount_,
        '0',
        tradeProviders.some((x) => x === TradeProvider.UNISWAP_V3) ? inputToken : undefined,
        tradeProviders.some((x) => x === TradeProvider.UNISWAP_V3) ? outputToken : undefined,
    )
    const uniswapV3 = useUniswapTradeComputed(uniswapV3_.value, inputToken, outputToken)
    const uniswapV3SwapEstimateGas = useUniswapTradeGasLimit(uniswapV3, TradeProvider.UNISWAP_V3)

    // zrx
    const zrx_ = useZrxTrade(
        TradeStrategy.ExactIn,
        inputAmount_,
        '0',
        tradeProviders.some((x) => x === TradeProvider.ZRX) ? inputToken : undefined,
        tradeProviders.some((x) => x === TradeProvider.ZRX) ? outputToken : undefined,
    )
    const zrx = useZrxTradeComputed(zrx_.value ?? null, TradeStrategy.ExactIn, inputToken, outputToken)
    const zrxSwapEstimateGas = useZrxTradeGasLimit(zrx)

    // balancer
    const balancer_ = useBalancerTrade(
        TradeStrategy.ExactIn,
        inputAmount_,
        '0',
        tradeProviders.some((x) => x === TradeProvider.BALANCER) ? inputToken : undefined,
        tradeProviders.some((x) => x === TradeProvider.BALANCER) ? outputToken : undefined,
    )
    const balancer = useBalancerTradeComputed(
        balancer_.value ?? null,
        TradeStrategy.ExactIn,
        inputAmount_,
        '0',
        inputToken,
        outputToken,
    )
    const balancerSwapEstimateGas = useBalancerTradeGasLimit(balancer)

    // dodo
    const dodo_ = useDODOTrade(
        TradeStrategy.ExactIn,
        inputAmount_,
        '0',
        tradeProviders.some((x) => x === TradeProvider.DODO) ? inputToken : undefined,
        tradeProviders.some((x) => x === TradeProvider.DODO) ? outputToken : undefined,
    )
    const dodo = useDODOTradeComputed(dodo_.value ?? null, TradeStrategy.ExactIn, inputToken, outputToken)
    const dodoSwapEstimateGas = useDODOTradeGasLimit(dodo)

    // bancor
    const bancor_ = useBancorTrade(
        TradeStrategy.ExactIn,
        inputAmount_,
        '0',
        tradeProviders.some((x) => x === TradeProvider.BANCOR) ? inputToken : undefined,
        tradeProviders.some((x) => x === TradeProvider.BANCOR) ? outputToken : undefined,
    )
    const bancor = useBancorTradeComputed(bancor_.value ?? null, TradeStrategy.ExactIn, inputToken, outputToken)
    const bancorSwapEstimateGas = useBancorTradeGasLimit(bancor)

    // openocean
    const openocean_ = useOpenOceanTrade(TradeStrategy.ExactIn, inputAmount_, '0', inputToken, outputToken)
    const openocean = useOpenOceanTradeComputed(
        openocean_.value ?? null,
        TradeStrategy.ExactIn,
        inputToken,
        outputToken,
    )
    const openoceanSwapEstimateGas = useOpenOceanTradeGasLimit(openocean as TradeComputed<SwapOOData> | null)

    const {
        trader_: traderjoe_,
        trader: traderjoe,
        traderEstimateGas: traderjoeEstimateGas,
    } = useUniswapV2Hook(tradeProviders, TradeProvider.TRADERJOE, inputAmount_, inputToken, outputToken)

    const allTradeResult = [
        { provider: TradeProvider.UNISWAP_V2, ...uniswapV2_, value: uniswapV2, gas: uniswapV2EstimateGas },
        { provider: TradeProvider.SUSHISWAP, ...sushiSwap_, value: sushiSwap, gas: sushiSwapEstimateGas },
        { provider: TradeProvider.SASHIMISWAP, ...sashimiSwap_, value: sashimiSwap, gas: sashimiSwapEstimateGas },
        { provider: TradeProvider.QUICKSWAP, ...quickSwap_, value: quickSwap, gas: quickSwapEstimateGas },
        { provider: TradeProvider.PANCAKESWAP, ...pancakeSwap_, value: pancakeSwap, gas: pancakeSwapEstimateGas },
        { provider: TradeProvider.UNISWAP_V3, ...uniswapV3_, value: uniswapV3, gas: uniswapV3SwapEstimateGas },
        { provider: TradeProvider.ZRX, ...zrx_, value: zrx, gas: { value: zrxSwapEstimateGas, loading: false } },
        { provider: TradeProvider.BALANCER, ...balancer_, value: balancer, gas: balancerSwapEstimateGas },
        { provider: TradeProvider.DODO, ...dodo_, value: dodo, gas: dodoSwapEstimateGas },
        { provider: TradeProvider.BANCOR, ...bancor_, value: bancor, gas: bancorSwapEstimateGas },
        { provider: TradeProvider.OPENOCEAN, ...openocean_, value: openocean, gas: openoceanSwapEstimateGas },
        { provider: TradeProvider.TRADERJOE, ...traderjoe_, value: traderjoe, gas: traderjoeEstimateGas },
    ]

    return nativeToken_.value
        ? tradeProviders.map((item) => ({
              provider: item,
              ...nativeToken_,
              value: nativeToken,
              gas: nativeTradeGasLimit,
          }))
        : allTradeResult.filter((item) => tradeProviders.some((provider) => item.provider === provider))
}
