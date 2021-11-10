import type { MaskSettingsEvents } from '@masknet/shared-base'
import { appearanceSettings, languageSettings, debugModeSetting, currentPersonaIdentifier } from './settings'
import {
    currentAccountSettings,
    currentBalanceSettings,
    currentBlockNumberSettings,
    currentChainIdSettings,
    currentCollectibleDataProviderSettings,
    currentNetworkSettings,
    currentPortfolioDataProviderSettings,
    currentProviderSettings,
    currentTokenPricesSettings,
} from '../plugins/Wallet/settings'
import {
    currentDataProviderSettings,
    ethereumNetworkTradeProviderSettings,
    polygonNetworkTradeProviderSettings,
    binanceNetworkTradeProviderSettings,
    arbitrumNetworkTradeProviderSettings,
    xdaiNetworkTradeProviderSettings,
} from '../plugins/Trader/settings'
import type { InternalSettings } from './createSettings'

type ToBeListedSettings = { [key in keyof MaskSettingsEvents]: InternalSettings<MaskSettingsEvents[key]> }
export function ToBeListened(): ToBeListedSettings {
    return {
        appearanceSettings,
        languageSettings,
        debugModeSetting,
        currentChainIdSettings,
        currentBalanceSettings,
        currentBlockNumberSettings,
        currentTokenPricesSettings,
        currentDataProviderSettings,
        currentProviderSettings,
        currentNetworkSettings,
        currentAccountSettings,
        currentPortfolioDataProviderSettings,
        currentCollectibleDataProviderSettings,
        currentPersonaIdentifier,
        ethereumNetworkTradeProviderSettings,
        polygonNetworkTradeProviderSettings,
        binanceNetworkTradeProviderSettings,
        arbitrumNetworkTradeProviderSettings,
        xdaiNetworkTradeProviderSettings,
    }
}
