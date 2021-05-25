import { useMemo } from 'react'
import BigNumber from 'bignumber.js'
import { NativeTokenDetailed, ERC20TokenDetailed, EthereumTokenType } from '../../../../web3/types'
import { TradeComputed, TradeStrategy } from '../../types'

const ZERO = new BigNumber(0)

export interface EtherWrapper {
    /**
     * if the trade wraps ether
     */
    isWrap: boolean

    /**
     * if the trade is an ETH-WETH pair
     */
    isEtherWrapper: boolean
}

export function useTradeComputed(
    isEtherWrapper: boolean,
    strategy: TradeStrategy,
    inputAmount: string,
    outputAmount: string,
    inputToken?: NativeTokenDetailed | ERC20TokenDetailed,
    outputToken?: NativeTokenDetailed | ERC20TokenDetailed,
) {
    return useMemo((): TradeComputed<EtherWrapper> | null => {
        if (!isEtherWrapper) return null

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
            nextMidPrice: ZERO,
            priceImpact: ZERO,
            priceImpactWithoutFee: ZERO,
            fee: ZERO,
            trade_: {
                isWrap:
                    (strategy === TradeStrategy.ExactIn && inputToken?.type === EthereumTokenType.Native) ||
                    (strategy === TradeStrategy.ExactOut && outputToken?.type === EthereumTokenType.Native),
                isEtherWrapper,
            },
        }
    }, [isEtherWrapper, strategy, inputAmount, outputAmount, inputToken, outputToken])
}
