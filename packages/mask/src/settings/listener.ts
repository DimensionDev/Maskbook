import {
    appearanceSettings,
    pluginIDSettings,
    languageSettings,
    debugModeSetting,
    currentPersonaIdentifier,
} from './settings'
import type { MaskSettingsEvents } from '@masknet/shared-base'
import {
    currentAccountSettings,
    currentBalanceSettings,
    currentBalancesSettings,
    currentBlockNumberSettings,
    currentChainIdSettings,
    currentNonFungibleAssetDataProviderSettings,
    currentNetworkSettings,
    currentFungibleAssetDataProviderSettings,
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
    optimisticNetworkTradeProviderSettings,
    celoNetworkTradeProviderSettings,
    fantomNetworkTradeProviderSettings,
} from '../plugins/Trader/settings'
import type { InternalSettings } from './createSettings'

type ToBeListedSettings = { [key in keyof MaskSettingsEvents]: InternalSettings<MaskSettingsEvents[key]> }
export function ToBeListened(): ToBeListedSettings {
    return {
        appearanceSettings,
        pluginIDSettings,
        languageSettings,
        debugModeSetting,
        currentChainIdSettings,
        currentBalanceSettings,
        currentBalancesSettings,
        currentBlockNumberSettings,
        currentTokenPricesSettings,
        currentDataProviderSettings,
        currentProviderSettings,
        currentNetworkSettings,
        currentAccountSettings,
        currentFungibleAssetDataProviderSettings,
        currentNonFungibleAssetDataProviderSettings,
        currentPersonaIdentifier,
        ethereumNetworkTradeProviderSettings,
        polygonNetworkTradeProviderSettings,
        binanceNetworkTradeProviderSettings,
        arbitrumNetworkTradeProviderSettings,
        xdaiNetworkTradeProviderSettings,
        celoNetworkTradeProviderSettings,
        fantomNetworkTradeProviderSettings,
        optimisticNetworkTradeProviderSettings,
    }
}
