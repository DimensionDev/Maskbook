import { ECKeyIdentifier, Identifier, PersonaIdentifier } from '@masknet/shared-base'
import { head } from 'lodash-unified'
import type { InternalSettings } from '../../settings/createSettings'
import {
    appearanceSettings,
    currentPersonaIdentifier,
    languageSettings,
    currentPluginEnabledStatus,
    pluginIDSettings,
} from '../../settings/settings'
import {
    currentDataProviderSettings,
    ethereumNetworkTradeProviderSettings,
    binanceNetworkTradeProviderSettings,
    polygonNetworkTradeProviderSettings,
    arbitrumNetworkTradeProviderSettings,
    xdaiNetworkTradeProviderSettings,
} from '../../plugins/Trader/settings'
import { queryMyPersonas } from './IdentityService'
import {
    currentBalanceSettings,
    currentBlockNumberSettings,
    currentAccountSettings,
    currentNetworkSettings,
    currentProviderSettings,
    currentChainIdSettings,
    currentFungibleAssetDataProviderSettings,
    currentNonFungibleAssetDataProviderSettings,
    currentGasOptionsSettings,
    currentEtherPriceSettings,
    currentTokenPricesSettings,
    currentMaskWalletLockStatusSettings,
    currentMaskWalletAccountSettings,
    currentMaskWalletChainIdSettings,
    currentMaskWalletNetworkSettings,
    currentBalancesSettings,
} from '../../plugins/Wallet/settings'
import { Flags, MaskMessages } from '../../../shared'
import { indexedDB_KVStorageBackend, inMemory_KVStorageBackend } from '../../../background/database/kv-storage'

function create<T>(settings: InternalSettings<T>) {
    async function get() {
        await settings.readyPromise
        return settings.value
    }
    async function set(val: T) {
        await settings.readyPromise
        settings.value = val
    }
    return [get, set] as const
}
export const [getPluginID, setPluginID] = create(pluginIDSettings)
export const [getTheme, setTheme] = create(appearanceSettings)
export const [getLanguage, setLanguage] = create(languageSettings)
export const [getChainId, setChainId] = create(currentChainIdSettings)
export const [getBalance, setBalance] = create(currentBalanceSettings)
export const [getBalances, setBalances] = create(currentBalancesSettings)
export const [getBlockNumber, setBlockNumber] = create(currentBlockNumberSettings)
export const [getEtherPrice, setEtherPrice] = create(currentEtherPriceSettings)
export const [getTokenPrices, setTokenPrices] = create(currentTokenPricesSettings)
export const [getGasOptions, setGasOptions] = create(currentGasOptionsSettings)
export const [getGasPrice, setGasPrice] = create(currentGasOptionsSettings)
export const [getTrendingDataSource, setTrendingDataSource] = create(currentDataProviderSettings)
export const [getEthereumNetworkTradeProvider, setEthNetworkTradeProvider] = create(
    ethereumNetworkTradeProviderSettings,
)
export const [getPolygonNetworkTradeProvider, setPolygonNetworkTradeProvider] = create(
    polygonNetworkTradeProviderSettings,
)
export const [getBinanceNetworkTradeProvider, setBinanceNetworkTradeProvider] = create(
    binanceNetworkTradeProviderSettings,
)
export const [getArbitrumNetworkTradeProvider, setArbitrumNetworkTradeProvider] = create(
    arbitrumNetworkTradeProviderSettings,
)
export const [getxDaiNetworkTradeProvider, setxDaiNetworkTradeProvider] = create(xdaiNetworkTradeProviderSettings)

export const [getCurrentSelectedWalletProvider, setCurrentSelectedWalletProvider] = create(currentProviderSettings)

export const [getCurrentSelectedWalletNetwork, setCurrentSelectedWalletNetwork] = create(currentNetworkSettings)

export const [getSelectedWalletAddress, setSelectedWalletAddress] = create(currentAccountSettings)

export const [getSelectedMaskWalletAddress, setSelectedMaskWalletAddress] = create(currentMaskWalletAccountSettings)

export const [getCurrentMaskWalletChainId, setCurrentMaskWalletChainId] = create(currentMaskWalletChainIdSettings)

export const [getCurrentMaskWalletNetworkType, setCurrentMaskWalletNetworkType] = create(
    currentMaskWalletNetworkSettings,
)

export const [getCurrentPortfolioDataProvider, setCurrentPortfolioDataProvider] = create(
    currentFungibleAssetDataProviderSettings,
)

export const [getCurrentCollectibleDataProvider, setCurrentCollectibleDataProvider] = create(
    currentNonFungibleAssetDataProviderSettings,
)

export const [getCurrentMaskWalletLockedSettings, setCurrentMaskWalletLockedSettings] = create(
    currentMaskWalletLockStatusSettings,
)

export async function getWalletAllowTestChain() {
    return Flags.wallet_allow_testnet
}

export async function getCurrentPersonaIdentifier(): Promise<PersonaIdentifier | undefined> {
    await currentPersonaIdentifier.readyPromise
    const personas = (await queryMyPersonas())
        .sort((a, b) => (a.createdAt > b.createdAt ? 1 : 0))
        .map((x) => x.identifier)
    const newVal = Identifier.fromString<PersonaIdentifier>(currentPersonaIdentifier.value, ECKeyIdentifier).unwrapOr(
        head(personas),
    )
    if (!newVal) return undefined
    if (personas.find((x) => x.equals(newVal))) return newVal
    if (personas[0]) currentPersonaIdentifier.value = personas[0].toText()
    return personas[0]
}
export async function setCurrentPersonaIdentifier(x: PersonaIdentifier) {
    await currentPersonaIdentifier.readyPromise
    currentPersonaIdentifier.value = x.toText()
}
export async function getPluginEnabled(id: string) {
    return currentPluginEnabledStatus['plugin:' + id].value
}
export async function setPluginEnabled(id: string, enabled: boolean) {
    currentPluginEnabledStatus['plugin:' + id].value = enabled

    if (enabled) MaskMessages.events.pluginEnabled.sendToAll(id)
    else MaskMessages.events.pluginDisabled.sendToAll(id)
}

export async function openTab(url: string) {
    await browser.tabs.create({ active: true, url })
}

export async function __kv_storage_write__(kind: 'indexedDB' | 'memory', key: string, value: unknown) {
    if (kind === 'memory') {
        return inMemory_KVStorageBackend.setValue(key, value)
    } else {
        return indexedDB_KVStorageBackend.setValue(key, value)
    }
}

export async function __kv_storage_read__(kind: 'indexedDB' | 'memory', key: string) {
    if (kind === 'memory') {
        return inMemory_KVStorageBackend.getValue(key)
    } else {
        return indexedDB_KVStorageBackend.getValue(key)
    }
}
