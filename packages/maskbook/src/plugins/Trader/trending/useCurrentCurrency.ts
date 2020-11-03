import { useEffect, useState } from 'react'
import { useAsync } from 'react-use'
import type { DataProvider, Currency, Settings } from '../types'
import Services from '../../../extension/service'
import { useValueRef } from '../../../utils/hooks/useValueRef'
import { getCurrentDataProviderGeneralSettings } from '../settings'

export function useCurrentCurrency(dataProvider: DataProvider) {
    const [currency, setCurrency] = useState<Currency | null>(null)
    const generalSettings = useValueRef<string>(getCurrentDataProviderGeneralSettings(dataProvider))

    // TODO:
    // support multiple crcurrencies
    const { value: currencies = [], loading, error } = useAsync(
        () => Services.Plugin.invokePlugin('maskbook.trader', 'getLimitedCurrenies', dataProvider),
        [dataProvider],
    )

    useEffect(() => {
        if (!currencies.length) return
        try {
            const parsed = JSON.parse(generalSettings || '{}') as Settings
            if (parsed.currency && currencies.some((x) => x.id === parsed.currency.id)) setCurrency(parsed.currency)
            else setCurrency(currencies[0])
        } catch (e) {
            setCurrency(null)
        }
    }, [dataProvider, generalSettings, currencies.map((x) => x.id).join()])

    return {
        value: loading ? null : currency,
        loading,
        error,
    }
}
