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
    arbitrumNetworkTradeProviderSettings,
    xdaiNetworkTradeProviderSettings,
    optimisticNetworkTradeProviderSettings,
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
    currentGasOptionsSettings,
    currentEtherPriceSettings,
    currentTokenPricesSettings,
    currentMaskWalletLockStatusSettings,
    currentMaskWalletAccountSettings,
    currentMaskWalletChainIdSettings,
    currentMaskWalletNetworkSettings,
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

export const [getOptimisticNetworkTradeProvider, setOptimisticNetworkTradeProvider] = create(
    optimisticNetworkTradeProviderSettings,
)

export const [getCurrentSelectedWalletProvider, setCurrentSelectedWalletProvider] = create(currentProviderSettings)

export const [getCurrentSelectedWalletNetwork, setCurrentSelectedWalletNetwork] = create(currentNetworkSettings)

export const [getSelectedWalletAddress, setSelectedWalletAddress] = create(currentAccountSettings)

export const [getSelectedMaskWalletAddress, setSelectedMaskWalletAddress] = create(currentMaskWalletAccountSettings)

export const [getCurrentMaskWalletChainId, setCurrentMaskWalletChainId] = create(currentMaskWalletChainIdSettings)

export const [getCurrentMaskWalletNetworkType, setCurrentMaskWalletNetworkType] = create(
    currentMaskWalletNetworkSettings,
)

export const [getCurrentPortfolioDataProvider, setCurrentPortfolioDataProvider] = create(
    currentPortfolioDataProviderSettings,
)

export const [getCurrentCollectibleDataProvider, setCurrentCollectibleDataProvider] = create(
    currentCollectibleDataProviderSettings,
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
}

export async function openTab(url: string) {
    await browser.tabs.create({ active: true, url })
}
