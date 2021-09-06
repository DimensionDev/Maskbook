import type { ValueRef } from '@dimensiondev/holoflows-kit'
import {
    allPostReplacementSettings,
    appearanceSettings,
    languageSettings,
    debugModeSetting,
    currentPersonaIdentifier,
} from './settings'
import {
    currentAccountSettings,
    currentBalanceSettings,
    currentEtherPriceSettings,
    currentBlockNumberSettings,
    currentChainIdSettings,
    currentCollectibleDataProviderSettings,
    currentNetworkSettings,
    currentPortfolioDataProviderSettings,
    currentProviderSettings,
    currentIsMaskWalletLockedSettings,
} from '../plugins/Wallet/settings'
import {
    currentDataProviderSettings,
    ethereumNetworkTradeProviderSettings,
    polygonNetworkTradeProviderSettings,
    binanceNetworkTradeProviderSettings,
} from '../plugins/Trader/settings'

export function ToBeListened() {
    return {
        allPostReplacementSettings,
        appearanceSettings,
        languageSettings,
        debugModeSetting,
        currentChainIdSettings,
        currentBalanceSettings,
        currentBlockNumberSettings,
        currentEtherPriceSettings,
        currentTrendingDataProviderSettings: currentDataProviderSettings,
        currentProviderSettings,
        currentNetworkSettings,
        currentAccountSettings,
        currentPortfolioDataProviderSettings,
        currentCollectibleDataProviderSettings,
        currentPersonaIdentifier,
        ethereumNetworkTradeProviderSettings,
        polygonNetworkTradeProviderSettings,
        binanceNetworkTradeProviderSettings,
        currentIsMaskWalletLockedSettings,
    }
}
export type SettingsEventName = ReturnType<typeof ToBeListened>

export type SettingsEvents = {
    [key in keyof SettingsEventName]: SettingsEventName[key] extends ValueRef<infer T> ? T : void
}
