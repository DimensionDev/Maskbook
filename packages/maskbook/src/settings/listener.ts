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
    currentMaskWalletAccountSettings,
    currentBalanceSettings,
    currentEtherPriceSettings,
    currentBlockNumberSettings,
    currentChainIdSettings,
    currentMaskWalletChainIdSettings,
    currentMaskWalletNetworkSettings,
    currentCollectibleDataProviderSettings,
    currentNetworkSettings,
    currentPortfolioDataProviderSettings,
    currentProviderSettings,
    currentMaskWalletLockStatusSettings,
    currentTokenPricesSettings,
} from '../plugins/Wallet/settings'
import {
    currentDataProviderSettings,
    ethereumNetworkTradeProviderSettings,
    polygonNetworkTradeProviderSettings,
    binanceNetworkTradeProviderSettings,
    arbitrumNetworkTradeProviderSettings,
    xdaiNetworkTradeProviderSettings,
    optimisticNetworkTradeProviderSettings,
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
        currentTokenPricesSettings,
        currentTrendingDataProviderSettings: currentDataProviderSettings,
        currentProviderSettings,
        currentNetworkSettings,
        currentAccountSettings,
        currentAccountMaskWalletSettings: currentMaskWalletAccountSettings,
        currentMaskWalletChainIdSettings,
        currentMaskWalletNetworkSettings,
        currentPortfolioDataProviderSettings,
        currentCollectibleDataProviderSettings,
        currentPersonaIdentifier,
        ethereumNetworkTradeProviderSettings,
        polygonNetworkTradeProviderSettings,
        binanceNetworkTradeProviderSettings,
        arbitrumNetworkTradeProviderSettings,
        xdaiNetworkTradeProviderSettings,
        optimisticNetworkTradeProviderSettings,
        currentMaskWalletLockedSettings: currentMaskWalletLockStatusSettings,
    }
}
export type SettingsEventName = ReturnType<typeof ToBeListened>

export type SettingsEvents = {
    [key in keyof SettingsEventName]: SettingsEventName[key] extends ValueRef<infer T> ? T : void
}
