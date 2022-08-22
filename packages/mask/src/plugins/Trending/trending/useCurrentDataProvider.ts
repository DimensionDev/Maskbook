import { useState, useEffect } from 'react'
import type { DataProvider } from '@masknet/public-api'
import { useSubscription } from 'use-subscription'
import { getDataProvider } from '../storage'

export function useCurrentDataProvider(availableDataProviders: DataProvider[]) {
    const currentDataProvider = useSubscription(getDataProvider().subscription)

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
