import { useValueRef } from '@masknet/shared'
import {
    currentTradeProviderSettings,
    getCurrentTradeProviderGeneralSettings,
    TradeProviderSettings,
} from '../settings'
import type { TradeProvider } from '../types'

export function useTradeProviderSettings(tradeProvider?: TradeProvider): TradeProviderSettings {
    const tradeProvider_ = useValueRef(currentTradeProviderSettings)
    const raw = useValueRef(getCurrentTradeProviderGeneralSettings(tradeProvider ?? tradeProvider_))

    try {
        return JSON.parse(raw)
    } catch {
        return { pools: [] }
    }
}
