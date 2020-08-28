import { useState, useEffect } from 'react'
import { Platform } from '../types'
import { getActivatedUI } from '../../../social-network/ui'
import { useValueRef } from '../../../utils/hooks/useValueRef'
import { currentTrendingViewPlatformSettings } from '../settings'

export function useCurrentPlatform(defaultPlatform: Platform) {
    const [platform, setPlatform] = useState(defaultPlatform)
    const trendingPlatformSettings = useValueRef<string>(
        currentTrendingViewPlatformSettings[getActivatedUI().networkIdentifier],
    )

    // sync platform
    useEffect(() => {
        if (String(platform) === trendingPlatformSettings) return
        if (trendingPlatformSettings === String(Platform.COIN_GECKO)) setPlatform(Platform.COIN_GECKO)
        else if (trendingPlatformSettings === String(Platform.COIN_MARKET_CAP)) setPlatform(Platform.COIN_MARKET_CAP)
    }, [platform, trendingPlatformSettings])
    return platform
}
