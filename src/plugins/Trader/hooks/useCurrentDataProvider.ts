import { useState, useEffect } from 'react'
import { DataProvider } from '../types'
import { useValueRef } from '../../../utils/hooks/useValueRef'
import { currentDataProviderSettings } from '../settings'

export function useCurrentDataProvider(availableDataProviders: DataProvider[]) {
    const [dataProvider, setDataProvider] = useState(
        availableDataProviders.length ? availableDataProviders[0] : DataProvider.COIN_GECKO,
    )
    const currentDataProvider = useValueRef<DataProvider>(currentDataProviderSettings)

    // sync data provider
    useEffect(() => {
        // cached data provider unavailable
        if (!availableDataProviders.includes(currentDataProvider)) return
        if (currentDataProvider === DataProvider.COIN_GECKO) setDataProvider(DataProvider.COIN_GECKO)
        else if (currentDataProvider === DataProvider.COIN_MARKET_CAP) setDataProvider(DataProvider.COIN_MARKET_CAP)
    }, [availableDataProviders.sort().join(','), currentDataProvider])
    return dataProvider
}
