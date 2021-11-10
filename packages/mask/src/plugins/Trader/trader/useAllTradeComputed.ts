import type { FungibleTokenDetailed } from '@masknet/web3-shared-evm'
import { pow10 } from '@masknet/web3-shared-evm'
import BigNumber from 'bignumber.js'
import { useTrade as useNativeTokenTrade } from './native/useTrade'
import { useTradeComputed as useNativeTokenTradeComputed } from './native/useTradeComputed'
import { TagType, TradeInfo, TradeStrategy } from '../types'
import { useV2Trade as useUniswapV2Trade, useV3Trade as useUniswapV3Trade } from './uniswap/useTrade'
import { useTradeComputed as useUniswapTradeComputed } from './uniswap/useTradeComputed'
import { useTrade as useZrxTrade } from './0x/useTrade'
import { useTradeComputed as useZrxTradeComputed } from './0x/useTradeComputed'
import { useTrade as useBalancerTrade } from './balancer/useTrade'
import { useTradeComputed as useBalancerTradeComputed } from './balancer/useTradeComputed'
import { useTrade as useDODOTrade } from './dodo/useTrade'
import { useTradeComputed as useDODOTradeComputed } from './dodo/useTradeComputed'
import { useTrade as useBancorTrade } from './bancor/useTrade'
import { useTradeComputed as useBancorTradeComputed } from './bancor/useTradeComputed'
import { TradeProvider } from '@masknet/public-api'
import { useAvailableTraderProviders } from '../trending/useAvailableTraderProviders'

export function useAllTradeComputed(
    inputAmount: string,
    inputToken?: FungibleTokenDetailed,
    outputToken?: FungibleTokenDetailed,
): TradeInfo[] {
    const inputTokenProduct = pow10(inputToken?.decimals ?? 0)
    const inputAmount_ = new BigNumber(inputAmount || '0').multipliedBy(inputTokenProduct).integerValue().toFixed()

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

    //uniswap-v2
    const uniswapV2_ = useUniswapV2Trade(
        TradeProvider.UNISWAP_V2,
        TradeStrategy.ExactIn,
        inputAmount_,
        '0',
        inputToken,
        outputToken,
    )

    const uniswapV2 = useUniswapTradeComputed(uniswapV2_.value, inputToken, outputToken)

    // sushi swap
    const sushiSwap_ = useUniswapV2Trade(
        TradeProvider.SUSHISWAP,
        TradeStrategy.ExactIn,
        inputAmount_,
        '0',
        inputToken,
        outputToken,
    )
    const sushiSwap = useUniswapTradeComputed(sushiSwap_.value, inputToken, outputToken)

    // sashimi swap
    const sashimiSwap_ = useUniswapV2Trade(
        TradeProvider.SASHIMISWAP,
        TradeStrategy.ExactIn,
        inputAmount_,
        '0',
        inputToken,
        outputToken,
    )
    const sashimiSwap = useUniswapTradeComputed(sashimiSwap_.value, inputToken, outputToken)

    // quick swap
    const quickSwap_ = useUniswapV2Trade(
        TradeProvider.QUICKSWAP,
        TradeStrategy.ExactIn,
        inputAmount_,
        '0',
        inputToken,
        outputToken,
    )
    const quickSwap = useUniswapTradeComputed(quickSwap_.value, inputToken, outputToken)

    // pancake swap
    const pancakeSwap_ = useUniswapV2Trade(
        TradeProvider.PANCAKESWAP,
        TradeStrategy.ExactIn,
        inputAmount_,
        '0',
        inputToken,
        outputToken,
    )
    const pancakeSwap = useUniswapTradeComputed(pancakeSwap_.value, inputToken, outputToken)

    // uniswap-v3 like providers
    const uniswapV3_ = useUniswapV3Trade(TradeStrategy.ExactIn, inputAmount_, '0', inputToken, outputToken)
    const uniswapV3 = useUniswapTradeComputed(uniswapV3_.value, inputToken, outputToken)

    // zrx
    const zrx_ = useZrxTrade(TradeStrategy.ExactIn, inputAmount_, '0', inputToken, outputToken)
    const zrx = useZrxTradeComputed(zrx_.value ?? null, TradeStrategy.ExactIn, inputToken, outputToken)

    // balancer
    const balancer_ = useBalancerTrade(TradeStrategy.ExactIn, inputAmount_, '0', inputToken, outputToken)
    const balancer = useBalancerTradeComputed(
        balancer_.value ?? null,
        TradeStrategy.ExactIn,
        inputAmount_,
        '0',
        inputToken,
        outputToken,
    )

    // dodo
    const dodo_ = useDODOTrade(TradeStrategy.ExactIn, inputAmount_, '0', inputToken, outputToken)
    const dodo = useDODOTradeComputed(dodo_.value ?? null, TradeStrategy.ExactIn, inputToken, outputToken)

    // bancor
    const bancor_ = useBancorTrade(TradeStrategy.ExactIn, inputAmount_, '0', inputToken, outputToken)

    const bancor = useBancorTradeComputed(bancor_.value ?? null, TradeStrategy.ExactIn, inputToken, outputToken)

    const allTradeResult = [
        { provider: TradeProvider.UNISWAP_V2, ...uniswapV2_, value: uniswapV2 },
        { provider: TradeProvider.SUSHISWAP, ...sushiSwap_, value: sushiSwap },
        { provider: TradeProvider.SASHIMISWAP, ...sashimiSwap_, value: sashimiSwap },
        { provider: TradeProvider.QUICKSWAP, ...quickSwap_, value: quickSwap },
        { provider: TradeProvider.PANCAKESWAP, ...pancakeSwap_, value: pancakeSwap },
        { provider: TradeProvider.UNISWAP_V3, ...uniswapV3_, value: uniswapV3 },
        { provider: TradeProvider.ZRX, ...zrx_, value: zrx },
        { provider: TradeProvider.BALANCER, ...balancer_, value: balancer },
        { provider: TradeProvider.DODO, ...dodo_, value: dodo },
        { provider: TradeProvider.BANCOR, ...bancor_, value: bancor },
    ]

    const { value: tradeProviders = [] } = useAvailableTraderProviders(TagType.CASH, 'MASK')

    return nativeToken_.value
        ? tradeProviders.map((item) => ({ provider: item, ...nativeToken_, value: nativeToken }))
        : allTradeResult.filter((item) => tradeProviders.some((provider) => item.provider === provider))
}
