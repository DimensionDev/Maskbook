import BigNumber from 'bignumber.js'
import { useMemo } from 'react'
import type { ERC20TokenDetailed, EtherTokenDetailed } from '../../../../web3/types'
import type { TradeComputed, TradeStrategy } from '../../types'

const ZERO = new BigNumber(0)

export function useTradeComputed(
    isEtherWrapper: boolean,
    strategy: TradeStrategy,
    inputAmount: string,
    outputAmount: string,
    inputToken?: EtherTokenDetailed | ERC20TokenDetailed,
    outputToken?: EtherTokenDetailed | ERC20TokenDetailed,
) {
    return useMemo((): TradeComputed<{
        /**
         * Detect if the trade is an ether wrapper
         */
        isEtherWrapper: boolean
    }> => {
        return {
            strategy,
            inputToken,
            outputToken,
            inputAmount: new BigNumber(inputAmount),
            outputAmount: new BigNumber(outputAmount),
            executionPrice: ZERO,
            maximumSold: ZERO,
            minimumReceived: ZERO,
            nextMidPrice: ZERO,
            priceImpact: ZERO,
            priceImpactWithoutFee: ZERO,
            fee: ZERO,
            trade_: {
                isEtherWrapper,
            },
        }
    }, [isEtherWrapper, strategy, inputAmount, outputAmount, inputToken, outputToken])
}
