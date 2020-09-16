import { useState, useEffect } from 'react'
import { Platform } from '../types'
import { useValueRef } from '../../../utils/hooks/useValueRef'
import { currentTrendingViewPlatformSettings } from '../settings'

export function useCurrentPlatform(availablePlatforms: Platform[]) {
    const [platform, setPlatform] = useState(availablePlatforms.length ? availablePlatforms[0] : Platform.COIN_GECKO)
    const trendingPlatformSettings = useValueRef<Platform>(currentTrendingViewPlatformSettings)

    // sync platform
    useEffect(() => {
        // cached platform unavailable
        if (!availablePlatforms.includes(trendingPlatformSettings)) return
        if (trendingPlatformSettings === Platform.COIN_GECKO) setPlatform(Platform.COIN_GECKO)
        else if (trendingPlatformSettings === Platform.COIN_MARKET_CAP) setPlatform(Platform.COIN_MARKET_CAP)
    }, [availablePlatforms.sort().join(','), trendingPlatformSettings])
    return platform
}
