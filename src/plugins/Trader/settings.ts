import { createNetworkSettings } from '../../settings/createSettings'
import { Platform } from './type'

export const currentTrendingViewPlatformSettings = createNetworkSettings('currentTrendingViewPlatformSettings')

const coinGeckoSettings = createNetworkSettings('currentTrendingViewPlatformCoinGeckoSettings')
const coinMarketCapSettings = createNetworkSettings('currentTrendingViewPlatformCoinMarketCapSettings')

export function getCurrentTrendingViewPlatformSettings(platform: Platform) {
    return platform === Platform.COIN_GECKO ? coinGeckoSettings : coinMarketCapSettings
}
