import { useMemo } from 'react'
import { useValueRef } from '@masknet/shared'
import { getCurrentPreferredCoinIdSettings } from '../settings'
import type { DataProvider } from '@masknet/public-api'

export function usePreferredCoinId(keyword: string, dataProvider: DataProvider) {
    const keyword_ = keyword.toLowerCase()
    const settings = useValueRef(getCurrentPreferredCoinIdSettings(dataProvider))

    return useMemo(() => {
        try {
            const parsedSettings = JSON.parse(settings) as Record<string, string>
            return parsedSettings[keyword_] ?? ''
        } catch {
            return ''
        }
    }, [keyword_, settings])
}
