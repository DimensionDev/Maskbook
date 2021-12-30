import { useMemo } from 'react'
import BigNumber from 'bignumber.js'
import { EthereumTokenType, FungibleTokenDetailed } from '@masknet/web3-shared-evm'
import { ZERO } from '@masknet/web3-shared-base'
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
    inputToken?: FungibleTokenDetailed,
    outputToken?: FungibleTokenDetailed,
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
                    (strategy === TradeStrategy.ExactIn && inputToken?.type === EthereumTokenType.Native) ||
                    (strategy === TradeStrategy.ExactOut && outputToken?.type === EthereumTokenType.Native),
                isNativeTokenWrapper,
            },
        }
    }, [isNativeTokenWrapper, strategy, inputAmount, outputAmount, inputToken, outputToken])
}
