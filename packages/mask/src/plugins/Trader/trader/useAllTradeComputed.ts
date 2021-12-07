import type { FungibleTokenDetailed } from '@masknet/web3-shared-evm'
import { pow10 } from '@masknet/web3-shared-evm'
import BigNumber from 'bignumber.js'
import { useTrade as useNativeTokenTrade } from './native/useTrade'
import { useTradeComputed as useNativeTokenTradeComputed } from './native/useTradeComputed'
import { TagType, TradeInfo, TradeStrategy } from '../types'
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
import { TradeProvider } from '@masknet/public-api'
import { useAvailableTraderProviders } from '../trending/useAvailableTraderProviders'
import { useNativeTradeGasLimit } from './useNativeTradeGasLimit'
import { TargetChainIdContext } from './useTargetChainIdContext'

export function useAllTradeComputed(
    inputAmount: string,
    inputToken?: FungibleTokenDetailed,
    outputToken?: FungibleTokenDetailed,
): TradeInfo[] {
    const { targetChainId } = TargetChainIdContext.useContainer()
    const inputTokenProduct = pow10(inputToken?.decimals ?? 0)
    const inputAmount_ = new BigNumber(inputAmount || '0').multipliedBy(inputTokenProduct).integerValue().toFixed()
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
    const uniswapV2_ = useUniswapV2Trade(
        TradeProvider.UNISWAP_V2,
        TradeStrategy.ExactIn,
        inputAmount_,
        '0',
        tradeProviders.some((x) => x === TradeProvider.UNISWAP_V2) ? inputToken : undefined,
        tradeProviders.some((x) => x === TradeProvider.UNISWAP_V2) ? outputToken : undefined,
    )
    const uniswapV2 = useUniswapTradeComputed(
        uniswapV2_.value,
        tradeProviders.some((x) => x === TradeProvider.UNISWAP_V2) ? inputToken : undefined,
        tradeProviders.some((x) => x === TradeProvider.UNISWAP_V2) ? outputToken : undefined,
    )

    const uniswapEstimateGas = useUniswapTradeGasLimit(uniswapV2, TradeProvider.UNISWAP_V2)

    // sushi swap
    const sushiSwap_ = useUniswapV2Trade(
        TradeProvider.SUSHISWAP,
        TradeStrategy.ExactIn,
        inputAmount_,
        '0',
        tradeProviders.some((x) => x === TradeProvider.SUSHISWAP) ? inputToken : undefined,
        tradeProviders.some((x) => x === TradeProvider.SUSHISWAP) ? outputToken : undefined,
    )
    const sushiSwap = useUniswapTradeComputed(sushiSwap_.value, inputToken, outputToken)
    const sushiSwapEstimateGas = useUniswapTradeGasLimit(sushiSwap, TradeProvider.SUSHISWAP)

    // sashimi swap
    const sashimiSwap_ = useUniswapV2Trade(
        TradeProvider.SASHIMISWAP,
        TradeStrategy.ExactIn,
        inputAmount_,
        '0',
        tradeProviders.some((x) => x === TradeProvider.SASHIMISWAP) ? inputToken : undefined,
        tradeProviders.some((x) => x === TradeProvider.SASHIMISWAP) ? outputToken : undefined,
    )
    const sashimiSwap = useUniswapTradeComputed(sashimiSwap_.value, inputToken, outputToken)
    const sashimiSwapEstimateGas = useUniswapTradeGasLimit(sashimiSwap, TradeProvider.SASHIMISWAP)

    // quick swap
    const quickSwap_ = useUniswapV2Trade(
        TradeProvider.QUICKSWAP,
        TradeStrategy.ExactIn,
        inputAmount_,
        '0',
        tradeProviders.some((x) => x === TradeProvider.QUICKSWAP) ? inputToken : undefined,
        tradeProviders.some((x) => x === TradeProvider.QUICKSWAP) ? outputToken : undefined,
    )
    const quickSwap = useUniswapTradeComputed(quickSwap_.value, inputToken, outputToken)
    const quickSwapEstimateGas = useUniswapTradeGasLimit(quickSwap, TradeProvider.QUICKSWAP)

    // pancake swap
    const pancakeSwap_ = useUniswapV2Trade(
        TradeProvider.PANCAKESWAP,
        TradeStrategy.ExactIn,
        inputAmount_,
        '0',
        tradeProviders.some((x) => x === TradeProvider.PANCAKESWAP) ? inputToken : undefined,
        tradeProviders.some((x) => x === TradeProvider.PANCAKESWAP) ? outputToken : undefined,
    )
    const pancakeSwap = useUniswapTradeComputed(pancakeSwap_.value, inputToken, outputToken)
    const pancakeSwapEstimateGas = useUniswapTradeGasLimit(pancakeSwap, TradeProvider.PANCAKESWAP)

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

    const allTradeResult = [
        { provider: TradeProvider.UNISWAP_V2, ...uniswapV2_, value: uniswapV2, gas: uniswapEstimateGas },
        { provider: TradeProvider.SUSHISWAP, ...sushiSwap_, value: sushiSwap, gas: sushiSwapEstimateGas },
        { provider: TradeProvider.SASHIMISWAP, ...sashimiSwap_, value: sashimiSwap, gas: sashimiSwapEstimateGas },
        { provider: TradeProvider.QUICKSWAP, ...quickSwap_, value: quickSwap, gas: quickSwapEstimateGas },
        { provider: TradeProvider.PANCAKESWAP, ...pancakeSwap_, value: pancakeSwap, gas: pancakeSwapEstimateGas },
        { provider: TradeProvider.UNISWAP_V3, ...uniswapV3_, value: uniswapV3, gas: uniswapV3SwapEstimateGas },
        { provider: TradeProvider.ZRX, ...zrx_, value: zrx, gas: { value: zrxSwapEstimateGas, loading: false } },
        { provider: TradeProvider.BALANCER, ...balancer_, value: balancer, gas: balancerSwapEstimateGas },
        { provider: TradeProvider.DODO, ...dodo_, value: dodo, gas: dodoSwapEstimateGas },
        { provider: TradeProvider.BANCOR, ...bancor_, value: bancor, gas: bancorSwapEstimateGas },
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
