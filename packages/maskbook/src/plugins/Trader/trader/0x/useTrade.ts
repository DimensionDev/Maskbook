import type { EtherTokenDetailed, ERC20TokenDetailed } from '../../../../web3/types'
import { TradeStrategy } from '../../types'

export function useTrade(
    strategy: TradeStrategy = TradeStrategy.ExactIn,
    inputAmount: string,
    outputAmount: string,
    inputToken?: EtherTokenDetailed | ERC20TokenDetailed,
    outputToken?: EtherTokenDetailed | ERC20TokenDetailed,
) {
    // TODO:
    // maybe we should support v1Trade in the future
    return {
        zrxTrade: null,
    }
}
