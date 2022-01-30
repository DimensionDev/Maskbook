import { EMPTY_LIST, FungibleTokenDetailed } from '@masknet/web3-shared-evm'
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

export function useAllTradeComputed(
    inputAmount: string,
    inputToken?: FungibleTokenDetailed,
    outputToken?: FungibleTokenDetailed,
    temporarySlippage?: number,
): TradeInfo[] {
    const { targetChainId } = TargetChainIdContext.useContainer()
    const inputTokenProduct = pow10(inputToken?.decimals ?? 0)
    const inputAmount_ = multipliedBy(inputAmount || '0', inputTokenProduct)
        .integerValue()
        .toFixed()
    const { value: tradeProviders = EMPTY_LIST } = useAvailableTraderProviders(TagType.CASH, 'MASK', targetChainId)

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

    // uniswap-v2
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
        temporarySlippage,
    )
    const uniswapV2EstimateGas = useUniswapTradeGasLimit(uniswapV2, TradeProvider.UNISWAP_V2)

    // sushi swap
    const sushiSwap_ = useUniswapV2Trade(
        TradeProvider.SUSHISWAP,
        TradeStrategy.ExactIn,
        inputAmount_,
        '0',
        tradeProviders.some((x) => x === TradeProvider.SUSHISWAP) ? inputToken : undefined,
        tradeProviders.some((x) => x === TradeProvider.SUSHISWAP) ? outputToken : undefined,
    )
    const sushiSwap = useUniswapTradeComputed(sushiSwap_.value, inputToken, outputToken, temporarySlippage)
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
    const sashimiSwap = useUniswapTradeComputed(sashimiSwap_.value, inputToken, outputToken, temporarySlippage)
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
    const quickSwap = useUniswapTradeComputed(quickSwap_.value, inputToken, outputToken, temporarySlippage)
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
    const pancakeSwap = useUniswapTradeComputed(pancakeSwap_.value, inputToken, outputToken, temporarySlippage)
    const pancakeSwapEstimateGas = useUniswapTradeGasLimit(pancakeSwap, TradeProvider.PANCAKESWAP)

    // uniswap-v3 like providers
    const uniswapV3_ = useUniswapV3Trade(
        TradeStrategy.ExactIn,
        inputAmount_,
        '0',
        tradeProviders.some((x) => x === TradeProvider.UNISWAP_V3) ? inputToken : undefined,
        tradeProviders.some((x) => x === TradeProvider.UNISWAP_V3) ? outputToken : undefined,
    )
    const uniswapV3 = useUniswapTradeComputed(uniswapV3_.value, inputToken, outputToken, temporarySlippage)
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
        temporarySlippage,
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
        temporarySlippage,
    )
    const bancor = useBancorTradeComputed(bancor_.value ?? null, TradeStrategy.ExactIn, inputToken, outputToken)
    const bancorSwapEstimateGas = useBancorTradeGasLimit(bancor)

    // traderjoe
    const traderJoe_ = useUniswapV2Trade(
        TradeProvider.TRADERJOE,
        TradeStrategy.ExactIn,
        inputAmount_,
        '0',
        tradeProviders.some((x) => x === TradeProvider.TRADERJOE) ? inputToken : undefined,
        tradeProviders.some((x) => x === TradeProvider.TRADERJOE) ? outputToken : undefined,
    )
    const traderJoe = useUniswapTradeComputed(traderJoe_.value, inputToken, outputToken)
    const traderJoeEstimateGas = useUniswapTradeGasLimit(traderJoe, TradeProvider.TRADERJOE)

    // pangolindex
    const pangolindex_ = useUniswapV2Trade(
        TradeProvider.PANGOLIN,
        TradeStrategy.ExactIn,
        inputAmount_,
        '0',
        tradeProviders.some((x) => x === TradeProvider.PANGOLIN) ? inputToken : undefined,
        tradeProviders.some((x) => x === TradeProvider.PANGOLIN) ? outputToken : undefined,
    )
    const pangolindex = useUniswapTradeComputed(pangolindex_.value, inputToken, outputToken)
    const pangolinEstimateGas = useUniswapTradeGasLimit(pangolindex, TradeProvider.PANGOLIN)

    // openocean
    const openocean_ = useOpenOceanTrade(
        TradeStrategy.ExactIn,
        inputAmount_,
        '0',
        inputToken,
        outputToken,
        temporarySlippage,
    )
    const openocean = useOpenOceanTradeComputed(
        openocean_.value ?? null,
        TradeStrategy.ExactIn,
        inputToken,
        outputToken,
    )
    const openoceanSwapEstimateGas = useOpenOceanTradeGasLimit(openocean as TradeComputed<SwapOOData> | null)

    // trisolaris
    const trisolaris_ = useUniswapV2Trade(
        TradeProvider.TRISOLARIS,
        TradeStrategy.ExactIn,
        inputAmount_,
        '0',
        tradeProviders.some((x) => x === TradeProvider.TRISOLARIS) ? inputToken : undefined,
        tradeProviders.some((x) => x === TradeProvider.TRISOLARIS) ? outputToken : undefined,
    )
    const trisolaris = useUniswapTradeComputed(trisolaris_.value, inputToken, outputToken)
    const trisolarisEstimateGas = useUniswapTradeGasLimit(trisolaris, TradeProvider.TRISOLARIS)

    // WannaSwap
    const wannaswap_ = useUniswapV2Trade(
        TradeProvider.WANNASWAP,
        TradeStrategy.ExactIn,
        inputAmount_,
        '0',
        tradeProviders.some((x) => x === TradeProvider.WANNASWAP) ? inputToken : undefined,
        tradeProviders.some((x) => x === TradeProvider.WANNASWAP) ? outputToken : undefined,
    )
    const wannaswap = useUniswapTradeComputed(wannaswap_.value, inputToken, outputToken)
    const wannaSwapEstimateGas = useUniswapTradeGasLimit(wannaswap, TradeProvider.WANNASWAP)

    // Solarbeam
    const solarbeam_ = useUniswapV2Trade(
        TradeProvider.SOLARBEAM,
        TradeStrategy.ExactIn,
        inputAmount_,
        '0',
        tradeProviders.some((x) => x === TradeProvider.SOLARBEAM) ? inputToken : undefined,
        tradeProviders.some((x) => x === TradeProvider.SOLARBEAM) ? outputToken : undefined,
    )
    const solarbeam = useUniswapTradeComputed(solarbeam_.value, inputToken, outputToken)
    const solarbeamEstimateGas = useUniswapTradeGasLimit(solarbeam, TradeProvider.SOLARBEAM)

    // Huckleberry
    const huckleberry_ = useUniswapV2Trade(
        TradeProvider.HUCKLEBERRY,
        TradeStrategy.ExactIn,
        inputAmount_,
        '0',
        tradeProviders.some((x) => x === TradeProvider.HUCKLEBERRY) ? inputToken : undefined,
        tradeProviders.some((x) => x === TradeProvider.HUCKLEBERRY) ? outputToken : undefined,
    )
    const huckleberry = useUniswapTradeComputed(huckleberry_.value, inputToken, outputToken)
    const huckleberryEstimateGas = useUniswapTradeGasLimit(huckleberry, TradeProvider.HUCKLEBERRY)

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
        { provider: TradeProvider.TRADERJOE, ...traderJoe_, value: traderJoe, gas: traderJoeEstimateGas },
        { provider: TradeProvider.PANGOLIN, ...pangolindex_, value: pangolindex, gas: pangolinEstimateGas },
        { provider: TradeProvider.OPENOCEAN, ...openocean_, value: openocean, gas: openoceanSwapEstimateGas },
        { provider: TradeProvider.WANNASWAP, ...wannaswap_, value: wannaswap, gas: wannaSwapEstimateGas },
        { provider: TradeProvider.TRISOLARIS, ...trisolaris_, value: trisolaris, gas: trisolarisEstimateGas },
        { provider: TradeProvider.SOLARBEAM, ...solarbeam_, value: solarbeam, gas: solarbeamEstimateGas },
        { provider: TradeProvider.HUCKLEBERRY, ...huckleberry_, value: huckleberry, gas: huckleberryEstimateGas },
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
