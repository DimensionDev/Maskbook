import type { TraderAPI } from '@masknet/web3-providers/types'
import type { NativeTokenWrapper } from '../trader/native/useTradeComputed.js'

export function isNativeTokenWrapper(
    trade: TraderAPI.TradeComputed | null,
): trade is TraderAPI.TradeComputed<NativeTokenWrapper> {
    const trade_ = trade as TraderAPI.TradeComputed<NativeTokenWrapper> | null
    return trade_?.trade_?.isNativeTokenWrapper ?? false
}
