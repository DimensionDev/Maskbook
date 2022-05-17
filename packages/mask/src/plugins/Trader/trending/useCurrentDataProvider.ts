import { useState, useEffect } from 'react'
import type { DataProvider } from '@masknet/public-api'
import { useValueRef } from '@masknet/shared-base-ui'
import { currentDataProviderSettings } from '../settings'

export function useCurrentDataProvider(availableDataProviders: DataProvider[]) {
    const currentDataProvider = useValueRef<DataProvider>(currentDataProviderSettings)
    const [dataProvider, setDataProvider] = useState(currentDataProvider)

    // sync data provider
    useEffect(() => {
        if (!availableDataProviders.length) return
        setDataProvider(
            availableDataProviders.includes(currentDataProvider) ? currentDataProvider : availableDataProviders[0],
        )
    }, [availableDataProviders.sort((a, b) => a - b).join(), currentDataProvider])
    return dataProvider
}
