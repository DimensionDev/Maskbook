import { useMemo } from 'react'
import { BigNumber } from 'bignumber.js'
import { ZERO } from '@masknet/web3-shared-base'
import { type TradeComputed, TradeStrategy } from '../../types/index.js'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useWeb3Others } from '@masknet/web3-hooks-base'

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
    inputToken?: Web3Helper.FungibleTokenAll,
    outputToken?: Web3Helper.FungibleTokenAll,
) {
    const Others = useWeb3Others()
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
                    (strategy === TradeStrategy.ExactIn && !!Others.isNativeTokenSchemaType(inputToken?.schema)) ||
                    (strategy === TradeStrategy.ExactOut && !!Others.isNativeTokenSchemaType(outputToken?.schema)),
                isNativeTokenWrapper,
            },
        }
    }, [
        isNativeTokenWrapper,
        strategy,
        inputAmount,
        outputAmount,
        inputToken,
        outputToken,
        Others.isNativeTokenSchemaType,
    ])
}
