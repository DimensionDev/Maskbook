import { useState, useEffect } from 'react'
import { Platform } from '../types'
import { useValueRef } from '../../../utils/hooks/useValueRef'
import { currentTrendingViewPlatformSettings } from '../settings'

export function useCurrentPlatform(availablePlatforms: Platform[]) {
    const [platform, setPlatform] = useState(availablePlatforms.length ? availablePlatforms[0] : Platform.COIN_GECKO)
    const trendingPlatformSettings = useValueRef<string>(currentTrendingViewPlatformSettings)

    // sync platform
    useEffect(() => {
        // cached platform unavailable
        if (!availablePlatforms.map(String).includes(trendingPlatformSettings)) return
        if (trendingPlatformSettings === String(Platform.COIN_GECKO)) setPlatform(Platform.COIN_GECKO)
        else if (trendingPlatformSettings === String(Platform.COIN_MARKET_CAP)) setPlatform(Platform.COIN_MARKET_CAP)
    }, [availablePlatforms.sort().join(','), trendingPlatformSettings])
    return platform
}
