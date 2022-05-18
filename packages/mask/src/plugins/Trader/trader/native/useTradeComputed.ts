import { useMemo } from 'react'
import BigNumber from 'bignumber.js'
import { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { FungibleToken, ZERO } from '@masknet/web3-shared-base'
import { TradeComputed, TradeStrategy } from '../../types'

export interface NativeTokenWrapper {
    /**
     * if the trade wraps the native token
     */
    isWrap: boolean

    /**
     * if the trade is an NATIVE-WNATIVE pair
     */
    isNativeTokenWrapper: boolean
}

export function useTradeComputed(
    isNativeTokenWrapper: boolean,
    strategy: TradeStrategy,
    inputAmount: string,
    outputAmount: string,
    inputToken?: FungibleToken<ChainId, SchemaType.Native | SchemaType.ERC20>,
    outputToken?: FungibleToken<ChainId, SchemaType.Native | SchemaType.ERC20>,
) {
    return useMemo((): TradeComputed<NativeTokenWrapper> | null => {
        if (!isNativeTokenWrapper) return null

        // the trade amount follows trade strategy
        const tradeAmount = new BigNumber(strategy === TradeStrategy.ExactIn ? inputAmount || '0' : outputAmount || '0')

        // skip to render 0s
        if (tradeAmount.isZero()) return null

        return {
            strategy,
            inputToken,
            outputToken,
            inputAmount: tradeAmount,
            outputAmount: tradeAmount,
            executionPrice: ZERO,
            maximumSold: ZERO,
            minimumReceived: tradeAmount,
            priceImpact: ZERO,
            fee: ZERO,
            trade_: {
                isWrap:
                    (strategy === TradeStrategy.ExactIn && inputToken?.schema === SchemaType.Native) ||
                    (strategy === TradeStrategy.ExactOut && outputToken?.schema === SchemaType.Native),
                isNativeTokenWrapper,
            },
        }
    }, [isNativeTokenWrapper, strategy, inputAmount, outputAmount, inputToken, outputToken])
}
