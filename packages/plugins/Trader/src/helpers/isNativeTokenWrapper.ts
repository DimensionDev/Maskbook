import type { TradeComputed } from '@masknet/web3-providers/types'
import type { NativeTokenWrapper } from '../trader/native/useTradeComputed.js'

export function isNativeTokenWrapper(trade: TradeComputed | null): trade is TradeComputed<NativeTokenWrapper> {
    const trade_ = trade as TradeComputed<NativeTokenWrapper> | null
    return trade_?.trade_?.isNativeTokenWrapper ?? false
}
