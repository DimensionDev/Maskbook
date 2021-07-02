import { useContext } from 'react'
import BigNumber from 'bignumber.js'
import type { FungibleTokenDetailed } from '@masknet/web3-shared'
import { pow10 } from '@masknet/web3-shared'
import { TradeProvider, TradeStrategy } from '../types'
import { useTrade as useNativeTokenTrade } from './native/useTrade'
import { useTradeComputed as useNativeTokenTradeComputed } from './native/useTradeComputed'
import { useTrade as useUniswapTrade } from './uniswap/useTrade'
import { useV2TradeComputed as useUniswapTradeComputed } from './uniswap/useV2TradeComputed'
import { useTradeComputed as useZrxTradeComputed } from './0x/useTradeComputed'
import { useTradeComputed as useBalancerTradeComputed } from './balancer/useTradeComputed'
import { useTrade as useZrxTrade } from './0x/useTrade'
import { useTrade as useBalancerTrade } from './balancer/useTrade'
import { unreachable } from '@dimensiondev/kit'
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

    // trade conetxt
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

    // uniswap like providers
    const uniswap_ = useUniswapTrade(
        strategy,
        context?.IS_UNISWAP_LIKE ? inputAmount_ : '0',
        context?.IS_UNISWAP_LIKE ? outputAmount_ : '0',
        inputToken,
        outputToken,
    )
    const uniswap = useUniswapTradeComputed(uniswap_.value, inputToken, outputToken)

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

    if (nativeToken_.value)
        return {
            ...nativeToken_,
            value: nativeToken,
        }

    switch (provider) {
        case TradeProvider.UNISWAP:
        case TradeProvider.SUSHISWAP:
        case TradeProvider.SASHIMISWAP:
        case TradeProvider.QUICKSWAP:
        case TradeProvider.PANCAKESWAP:
            return {
                ...uniswap_,
                value: uniswap,
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
        default:
            unreachable(provider)
    }
}
