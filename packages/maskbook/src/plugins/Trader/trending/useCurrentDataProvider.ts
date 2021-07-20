import { useState, useEffect } from 'react'
import { DataProvider } from '../types'
import { useValueRef } from '@masknet/shared'
import { currentDataProviderSettings } from '../settings'

export function useCurrentDataProvider(availableDataProviders: DataProvider[]) {
    const [dataProvider, setDataProvider] = useState(
        availableDataProviders.length ? availableDataProviders[0] : DataProvider.COIN_GECKO,
    )
    const currentDataProvider = useValueRef<DataProvider>(currentDataProviderSettings)

    // sync data provider
    useEffect(() => {
        if (!availableDataProviders.length) return
        setDataProvider(
            availableDataProviders.includes(currentDataProvider) ? currentDataProvider : availableDataProviders[0],
        )
    }, [availableDataProviders.sort().join(), currentDataProvider])
    return dataProvider
}
