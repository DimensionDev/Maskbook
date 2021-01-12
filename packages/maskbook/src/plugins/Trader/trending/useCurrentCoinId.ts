import { useMemo } from 'react'
import { useValueRef } from '../../../utils/hooks/useValueRef'
import { getCurrentPreferredCoinIdSettings } from '../settings'
import type { DataProvider } from '../types'

export function useCurrentCoinId(keyword: string, dataProvider: DataProvider) {
    const keyword_ = keyword.toLowerCase()
    const settings = useValueRef(getCurrentPreferredCoinIdSettings(dataProvider))

    return useMemo(() => {
        try {
            const parsedSettings = JSON.parse(settings) as Record<string, string>
            return parsedSettings[keyword_] ?? ''
        } catch (e) {
            return ''
        }
    }, [keyword_, settings])
}
