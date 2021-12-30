import type { TradeProvider } from '@masknet/public-api'
import { useValueRef } from '@masknet/shared'
import {
    currentTradeProviderSettings,
    getCurrentTradeProviderGeneralSettings,
    TradeProviderSettings,
} from '../settings'

export function useTradeProviderSettings(tradeProvider?: TradeProvider): TradeProviderSettings {
    const tradeProvider_ = useValueRef(currentTradeProviderSettings)
    const raw = useValueRef(getCurrentTradeProviderGeneralSettings(tradeProvider ?? tradeProvider_))

    try {
        return JSON.parse(raw)
    } catch {
        return { pools: [] }
    }
}
