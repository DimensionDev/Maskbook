import type { NativeTokenWrapper } from '../trader/native/useTradeComputed.js'
import type { TradeComputed } from '../types/index.js'

export function isNativeTokenWrapper(trade: TradeComputed | null): trade is TradeComputed<NativeTokenWrapper> {
    const trade_ = trade as TradeComputed<NativeTokenWrapper> | null
    return trade_?.trade_?.isNativeTokenWrapper ?? false
}
