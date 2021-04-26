import { BigNumber as BN } from '@ethersproject/bignumber'
import { BIPS_BASE } from '../constants'
import type { EtherWrapper } from '../trader/ether/useTradeComputed'
import type { TradeComputed } from '../types'

export function toBips(bips: number) {
    return BN.from(bips).div(BIPS_BASE)
}

export function isEtherWrapper(trade: TradeComputed<unknown> | null): trade is TradeComputed<EtherWrapper> {
    const trade_ = trade as TradeComputed<EtherWrapper> | null
    return trade_?.trade_?.isEtherWrapper ?? false
}
