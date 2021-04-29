import BigNumber from 'bignumber.js'
import { BIPS_BASE } from '../constants'
import type { EtherWrapper } from '../trader/ether/useTradeComputed'
import type { TradeComputed } from '../types'

export function toBips(bips: number) {
    return new BigNumber(bips).dividedBy(BIPS_BASE)
}

export function isEtherWrapper(trade: TradeComputed<unknown> | null): trade is TradeComputed<EtherWrapper> {
    const trade_ = trade as TradeComputed<EtherWrapper> | null
    return trade_?.trade_?.isEtherWrapper ?? false
}
