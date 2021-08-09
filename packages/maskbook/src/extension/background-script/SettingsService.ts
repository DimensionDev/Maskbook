import { ECKeyIdentifier, Identifier, PersonaIdentifier } from '@masknet/shared'
import { head } from 'lodash-es'
import type { InternalSettings } from '../../settings/createSettings'
import {
    appearanceSettings,
    currentPersonaIdentifier,
    languageSettings,
    currentPluginEnabledStatus,
} from '../../settings/settings'
import {
    currentDataProviderSettings,
    ethereumNetworkTradeProviderSettings,
    binanceNetworkTradeProviderSettings,
    polygonNetworkTradeProviderSettings,
} from '../../plugins/Trader/settings'
import { queryMyPersonas } from './IdentityService'
import {
    currentBalanceSettings,
    currentBlockNumberSettings,
    currentCollectibleDataProviderSettings,
    currentAccountSettings,
    currentNetworkSettings,
    currentProviderSettings,
    currentChainIdSettings,
    currentPortfolioDataProviderSettings,
    currentGasNowSettings,
    currentEtherPriceSettings,
} from '../../plugins/Wallet/settings'
import { Flags } from '../../utils'

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
export const [getTheme, setTheme] = create(appearanceSettings)
export const [getLanguage, setLanguage] = create(languageSettings)
export const [getChainId, setChainId] = create(currentChainIdSettings)
export const [getBalance, setBalance] = create(currentBalanceSettings)
export const [getBlockNumber, setBlockNumber] = create(currentBlockNumberSettings)
export const [getEtherPrice, setEtherPrice] = create(currentEtherPriceSettings)
export const [getGasNow, setGasNow] = create(currentGasNowSettings)
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

export const [getCurrentSelectedWalletProvider, setCurrentSelectedWalletProvider] = create(currentProviderSettings)

export const [getCurrentSelectedWalletNetwork, setCurrentSelectedWalletNetwork] = create(currentNetworkSettings)

export const [getSelectedWalletAddress, setSelectedWalletAddress] = create(currentAccountSettings)

export const [getCurrentPortfolioDataProvider, setCurrentPortfolioDataProvider] = create(
    currentPortfolioDataProviderSettings,
)

export const [getCurrentCollectibleDataProvider, setCurrentCollectibleDataProvider] = create(
    currentCollectibleDataProviderSettings,
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
export async function isPluginEnabled(id: string) {
    return currentPluginEnabledStatus['plugin:' + id].value
}
export async function setPluginStatus(id: string, enabled: boolean) {
    currentPluginEnabledStatus['plugin:' + id].value = enabled
}
const key = 'openSNSAndActivatePlugin'
/**
 * This function will open a new web page, then open the composition dialog and activate the composition entry of the given plugin.
 * @param url URL to open
 * @param pluginID Plugin to activate
 */
export async function openSNSAndActivatePlugin(url: string, pluginID: string) {
    await browser.tabs.create({ active: true, url })
    sessionStorage.setItem(key, pluginID)
}
export async function shouldActivatePluginOnSNSStart() {
    const val = sessionStorage.getItem(key)
    sessionStorage.removeItem(key)
    return val
}
