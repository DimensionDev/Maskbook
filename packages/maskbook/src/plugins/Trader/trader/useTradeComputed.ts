import { useContext } from 'react'
import BigNumber from 'bignumber.js'
import type { FungibleTokenDetailed } from '@masknet/web3-shared'
import { pow10 } from '@masknet/web3-shared'
import type { TradeStrategy } from '../types'
import { useTrade as useNativeTokenTrade } from './native/useTrade'
import { useTradeComputed as useNativeTokenTradeComputed } from './native/useTradeComputed'
import { useV2Trade as useUniswapV2Trade, useV3Trade as useUniswapV3Trade } from './uniswap/useTrade'
import { useTradeComputed as useUniswapTradeComputed } from './uniswap/useTradeComputed'
import { useTradeComputed as useZrxTradeComputed } from './0x/useTradeComputed'
import { useTradeComputed as useBalancerTradeComputed } from './balancer/useTradeComputed'
import { useTradeComputed as useDODOTradeComputed } from './dodo/useTradeComputed'
import { useTradeComputed as useBancorTradeComputed } from './bancor/useTradeComputed'
import { useTrade as useZrxTrade } from './0x/useTrade'
import { useTrade as useBalancerTrade } from './balancer/useTrade'
import { useTrade as useDODOTrade } from './dodo/useTrade'
import { useTrade as useBancorTrade } from './bancor/useTrade'

import { unreachable } from '@dimensiondev/kit'
import { TradeProvider } from '@masknet/public-api'
import { TradeContext } from './useTradeContext'

export function useTradeComputed(
    provider: TradeProvider,
    strategy: TradeStrategy,
    inputAmount: string,
    outputAmount: string,
    inputToken?: FungibleTokenDetailed,
    outputToken?: FungibleTokenDetailed,
) {
    const inputTokenProduct = pow10(inputToken?.decimals ?? 0)
    const outputTokenProduct = pow10(outputToken?.decimals ?? 0)
    const inputAmount_ = new BigNumber(inputAmount || '0').multipliedBy(inputTokenProduct).integerValue().toFixed()
    const outputAmount_ = new BigNumber(outputAmount || '0').multipliedBy(outputTokenProduct).integerValue().toFixed()

    // trade context
    const context = useContext(TradeContext)

    // NATIVE-WNATIVE pair
    const nativeToken_ = useNativeTokenTrade(inputToken, outputToken)
    const nativeToken = useNativeTokenTradeComputed(
        nativeToken_.value ?? false,
        strategy,
        inputAmount_,
        outputAmount_,
        inputToken,
        outputToken,
    )

    // uniswap-v2 like providers
    const uniswapV2_ = useUniswapV2Trade(
        strategy,
        context?.IS_UNISWAP_V2_LIKE ? inputAmount_ : '0',
        context?.IS_UNISWAP_V2_LIKE ? outputAmount_ : '0',
        inputToken,
        outputToken,
    )
    const uniswapV2 = useUniswapTradeComputed(uniswapV2_.value, inputToken, outputToken)

    // uniswap-v3 like providers
    const uniswapV3_ = useUniswapV3Trade(
        strategy,
        context?.IS_UNISWAP_V3_LIKE ? inputAmount_ : '0',
        context?.IS_UNISWAP_V3_LIKE ? outputAmount_ : '0',
        inputToken,
        outputToken,
    )
    const uniswapV3 = useUniswapTradeComputed(uniswapV3_.value, inputToken, outputToken)

    // zrx
    const zrx_ = useZrxTrade(
        strategy,
        provider === TradeProvider.ZRX ? inputAmount_ : '0',
        provider === TradeProvider.ZRX ? outputAmount_ : '0',
        inputToken,
        outputToken,
    )
    const zrx = useZrxTradeComputed(zrx_.value ?? null, strategy, inputToken, outputToken)

    // balancer
    const balancer_ = useBalancerTrade(
        strategy,
        provider === TradeProvider.BALANCER ? inputAmount_ : '0',
        provider === TradeProvider.BALANCER ? outputAmount_ : '0',
        inputToken,
        outputToken,
    )
    const balancer = useBalancerTradeComputed(
        balancer_.value ?? null,
        strategy,
        provider === TradeProvider.BALANCER ? inputAmount_ : '0',
        provider === TradeProvider.BALANCER ? outputAmount_ : '0',
        inputToken,
        outputToken,
    )

    // dodo
    const dodo_ = useDODOTrade(
        strategy,
        provider === TradeProvider.DODO ? inputAmount_ : '0',
        provider === TradeProvider.DODO ? outputAmount_ : '0',
        inputToken,
        outputToken,
    )
    const dodo = useDODOTradeComputed(dodo_.value ?? null, strategy, inputToken, outputToken)

    const bancor_ = useBancorTrade(
        strategy,
        provider === TradeProvider.BANCOR ? inputAmount_ : '0',
        provider === TradeProvider.BANCOR ? outputAmount_ : '0',
        inputToken,
        outputToken,
    )

    const bancor = useBancorTradeComputed(bancor_.value ?? null, strategy, inputToken, outputToken)

    if (nativeToken_.value)
        return {
            ...nativeToken_,
            value: nativeToken,
        }

    switch (provider) {
        case TradeProvider.UNISWAP_V2:
        case TradeProvider.SUSHISWAP:
        case TradeProvider.SASHIMISWAP:
        case TradeProvider.QUICKSWAP:
        case TradeProvider.PANCAKESWAP:
            return {
                ...uniswapV2_,
                value: uniswapV2,
            }
        case TradeProvider.UNISWAP_V3:
            return {
                ...uniswapV3_,
                value: uniswapV3,
            }
        case TradeProvider.ZRX:
            return {
                ...zrx_,
                value: zrx,
            }
        case TradeProvider.BALANCER:
            return {
                ...balancer_,
                value: balancer,
            }
        case TradeProvider.DODO:
            return {
                ...dodo_,
                value: dodo,
            }
        case TradeProvider.BANCOR:
            return {
                ...bancor_,
                value: bancor,
            }
        default:
            unreachable(provider)
    }
}
