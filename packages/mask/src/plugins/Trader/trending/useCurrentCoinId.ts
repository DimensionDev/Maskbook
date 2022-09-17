import { useMemo } from 'react'
import { useValueRef } from '@masknet/shared-base-ui'
import { getCurrentPreferredCoinIdSettings } from '../settings.js'
import type { DataProvider } from '@masknet/public-api'

export function usePreferredCoinId(keyword: string, dataProvider: DataProvider) {
    const kw = keyword.toLowerCase()
    const settings = useValueRef(getCurrentPreferredCoinIdSettings(dataProvider))

    return useMemo(() => {
        try {
            const parsedSettings = JSON.parse(settings) as Record<string, string>
            return parsedSettings[kw] ?? ''
        } catch {
            return ''
        }
    }, [kw, settings])
}
