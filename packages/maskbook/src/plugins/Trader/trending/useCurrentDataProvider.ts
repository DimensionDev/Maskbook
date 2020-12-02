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
        setDataProvider(currentDataProvider)
    }, [availableDataProviders.sort().join(','), currentDataProvider])
    return dataProvider
}
