import { useMemo } from 'react'
import BigNumber from 'bignumber.js'
import { BigNumber as BN } from '@ethersproject/bignumber'
import { ERC20TokenDetailed, EthereumTokenType, EtherTokenDetailed } from '../../../../web3/types'
import { TradeComputed, TradeStrategy } from '../../types'

const BN_ZERO = BN.from(0)
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
    inputToken?: EtherTokenDetailed | ERC20TokenDetailed,
    outputToken?: EtherTokenDetailed | ERC20TokenDetailed,
) {
    return useMemo((): TradeComputed<EtherWrapper> | null => {
        console.log('DEBUG: useTradeComputed')
        console.log({
            isEtherWrapper,
            inputAmount,
            outputAmount,
        })

        if (!isEtherWrapper) return null

        // the trade amount follows trade strategy
        const tradeAmount = BN.from(strategy === TradeStrategy.ExactIn ? inputAmount || '0' : outputAmount || '0')

        // skip to render 0s
        if (tradeAmount.isZero()) return null

        return {
            strategy,
            inputToken,
            outputToken,
            inputAmount: tradeAmount,
            outputAmount: tradeAmount,
            executionPrice: BN_ZERO,
            maximumSold: BN_ZERO,
            minimumReceived: tradeAmount,
            nextMidPrice: BN_ZERO,
            priceImpact: BN_ZERO,
            priceImpactWithoutFee: BN_ZERO,
            fee: BN_ZERO,
            trade_: {
                isWrap:
                    (strategy === TradeStrategy.ExactIn && inputToken?.type === EthereumTokenType.Ether) ||
                    (strategy === TradeStrategy.ExactOut && outputToken?.type === EthereumTokenType.Ether),
                isEtherWrapper,
            },
        }
    }, [isEtherWrapper, strategy, inputAmount, outputAmount, inputToken, outputToken])
}
