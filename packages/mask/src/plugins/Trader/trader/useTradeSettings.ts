import type { TradeProvider } from '@masknet/public-api'
import { useValueRef } from '@masknet/shared'
import { getCurrentTradeProviderGeneralSettings, TradeProviderSettings } from '../settings'

export function useTradeProviderSettings(tradeProvider: TradeProvider): TradeProviderSettings {
    const raw = useValueRef(getCurrentTradeProviderGeneralSettings(tradeProvider))

    try {
        return JSON.parse(raw)
    } catch {
        return { pools: [] }
    }
}
