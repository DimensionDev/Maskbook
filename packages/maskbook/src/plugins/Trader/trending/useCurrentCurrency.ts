import { useEffect, useState } from 'react'
import { useAsync } from 'react-use'
import { useValueRef } from '@masknet/shared'
import type { Currency, Settings } from '../types'
import type { DataProvider } from '@masknet/public-api'
import { getCurrentDataProviderGeneralSettings } from '../settings'
import { PluginTraderRPC } from '../messages'

export function useCurrentCurrency(dataProvider: DataProvider) {
    const [currency, setCurrency] = useState<Currency | null>(null)
    const generalSettings = useValueRef<string>(getCurrentDataProviderGeneralSettings(dataProvider))

    // TODO:
    // support multiple crcurrencies
    const {
        value: currencies = [],
        loading,
        error,
    } = useAsync(() => PluginTraderRPC.getLimitedCurrenies(dataProvider), [dataProvider])

    useEffect(() => {
        if (!currencies.length) return
        try {
            const parsed = JSON.parse(generalSettings || '{}') as Settings
            if (parsed.currency && currencies.some((x) => x.id === parsed.currency.id)) setCurrency(parsed.currency)
            else setCurrency(currencies[0])
        } catch {
            setCurrency(null)
        }
    }, [dataProvider, generalSettings, currencies.map((x) => x.id).join()])

    return {
        value: loading ? null : currency,
        loading,
        error,
    }
}
