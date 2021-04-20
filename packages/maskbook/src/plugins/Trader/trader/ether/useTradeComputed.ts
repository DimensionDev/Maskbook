import { useMemo } from 'react'
import BigNumber from 'bignumber.js'
import { ERC20TokenDetailed, EthereumTokenType, EtherTokenDetailed } from '../../../../web3/types'
import { TradeComputed, TradeStrategy } from '../../types'

const ZERO = new BigNumber(0)

export interface EtherWrapper {
    /**
     * if trade wraps ether
     */
    isWrap: boolean

    /**
     * if the trade is an ether wrapper
     */
    isEtherWrapper: boolean
}

export function useTradeComputed(
    isEtherWrapper: boolean,
    strategy: TradeStrategy,
    inputAmount: string,
    outputAmount: string,
    inputToken?: EtherTokenDetailed | ERC20TokenDetailed,
    outputToken?: EtherTokenDetailed | ERC20TokenDetailed,
) {
    return useMemo((): TradeComputed<EtherWrapper> | null => {
        if (!isEtherWrapper) return null

        const inputAmount_ = new BigNumber(inputAmount || '0')
        const outputAmount_ = new BigNumber(outputAmount || '0')
        const tradeAmount = inputAmount_.isGreaterThan(0) ? inputAmount_ : outputAmount_
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
                isWrap: strategy === TradeStrategy.ExactIn && inputToken?.type === EthereumTokenType.Ether,
                isEtherWrapper,
            },
        }
    }, [isEtherWrapper, strategy, inputAmount, outputAmount, inputToken, outputToken])
}
