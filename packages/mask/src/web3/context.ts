import { noop } from 'lodash-unified'
import type { Subscription } from 'use-subscription'
import {
    ERC20TokenDetailed,
    ERC721TokenDetailed,
    ERC1155TokenDetailed,
    EthereumTokenType,
    ProviderType,
    Web3ProviderType,
    resolveProviderIdentityKey,
    isInjectedProvider,
} from '@masknet/web3-shared-evm'
import { bridgedEthereumProvider } from '@masknet/injected-script'
import {
    currentBlockNumberSettings,
    currentBalanceSettings,
    currentAccountSettings,
    currentNetworkSettings,
    currentProviderSettings,
    currentChainIdSettings,
    currentPortfolioDataProviderSettings,
    currentTokenPricesSettings,
    currentMaskWalletChainIdSettings,
    currentMaskWalletNetworkSettings,
    currentMaskWalletAccountSettings,
    currentMaskWalletBalanceSettings,
} from '../plugins/Wallet/settings'
import { WalletMessages, WalletRPC } from '../plugins/Wallet/messages'
import type { InternalSettings } from '../settings/createSettings'
import { Flags } from '../../shared'
import { createExternalProvider } from './helpers'
import Services from '../extension/service'

function createWeb3Context(disablePopup = false, isMask = false): Web3ProviderType {
    const Web3Provider = createExternalProvider(
        () =>
            isMask
                ? {
                      account: currentMaskWalletAccountSettings.value,
                      chainId: currentMaskWalletChainIdSettings.value,
                      providerType: ProviderType.MaskWallet,
                  }
                : {
                      account: currentAccountSettings.value,
                      chainId: currentChainIdSettings.value,
                      providerType: currentProviderSettings.value,
                  },
        () => ({
            popupsWindow: !disablePopup,
        }),
    )

    return {
        provider: createStaticSubscription(() => Web3Provider),
        allowTestnet: createStaticSubscription(() => Flags.wallet_allow_testnet),
        chainId: createSubscriptionFromSettings(isMask ? currentMaskWalletChainIdSettings : currentChainIdSettings),
        account: createSubscriptionFromAsync(
            async () => {
                try {
                    await currentAccountSettings.readyPromise
                    await currentMaskWalletAccountSettings.readyPromise
                    await currentProviderSettings.readyPromise
                } catch (error) {
                    // do nothing
                }

                const account = isMask ? currentMaskWalletAccountSettings.value : currentAccountSettings.value
                const providerType = currentProviderSettings.value

                if (location.href.includes('popups.html')) return account
                if (!isInjectedProvider(providerType)) return account

                try {
                    const propertyKey = resolveProviderIdentityKey(providerType)
                    if (!propertyKey) return ''
                    const propertyValue = await bridgedEthereumProvider.getProperty(propertyKey)
                    if (propertyValue === true) return account
                    return ''
                } catch (error) {
                    return ''
                }
            },
            '',
            (callback) => {
                const a = currentAccountSettings.addListener(callback)
                const b = currentMaskWalletAccountSettings.addListener(callback)
                const c = currentProviderSettings.addListener(callback)
                return () => void [a(), b(), c()]
            },
        ),
        balance: createSubscriptionFromSettings(isMask ? currentMaskWalletBalanceSettings : currentBalanceSettings),
        blockNumber: createSubscriptionFromSettings(currentBlockNumberSettings),
        tokenPrices: createSubscriptionFromSettings(currentTokenPricesSettings),
        walletPrimary: createSubscriptionFromAsync(
            WalletRPC.getWalletPrimary,
            null,
            WalletMessages.events.walletsUpdated.on,
        ),
        wallets: createSubscriptionFromAsync(WalletRPC.getWallets, [], WalletMessages.events.walletsUpdated.on),
        providerType: isMask
            ? createStaticSubscription(() => ProviderType.MaskWallet)
            : createSubscriptionFromSettings(currentProviderSettings),
        networkType: createSubscriptionFromSettings(isMask ? currentMaskWalletNetworkSettings : currentNetworkSettings),
        erc20Tokens: createSubscriptionFromAsync(
            () => WalletRPC.getTokens<ERC20TokenDetailed>(EthereumTokenType.ERC20),
            [],
            WalletMessages.events.erc20TokensUpdated.on,
        ),
        erc721Tokens: createSubscriptionFromAsync(
            () => WalletRPC.getTokens<ERC721TokenDetailed>(EthereumTokenType.ERC721),
            [],
            WalletMessages.events.erc721TokensUpdated.on,
        ),
        erc1155Tokens: createSubscriptionFromAsync(
            () => WalletRPC.getTokens<ERC1155TokenDetailed>(EthereumTokenType.ERC1155),
            [],
            WalletMessages.events.erc1155TokensUpdated.on,
        ),
        portfolioProvider: createSubscriptionFromSettings(currentPortfolioDataProviderSettings),

        addToken: WalletRPC.addToken,
        removeToken: WalletRPC.removeToken,
        trustToken: WalletRPC.trustToken,
        blockToken: WalletRPC.blockToken,

        getAssetsList: WalletRPC.getAssetsList,
        getAssetsListNFT: WalletRPC.getAssetsListNFT,
        getCollectionsNFT: WalletRPC.getCollectionsNFT,
        getAddressNamesList: WalletRPC.getAddressNames,
        getTransactionList: WalletRPC.getTransactionList,
        fetchERC20TokensFromTokenLists: Services.Ethereum.fetchERC20TokensFromTokenLists,
    }
}

export const Web3Context = createWeb3Context(false, false)
export const PopupWeb3Context = createWeb3Context(true, true)
export const SwapWeb3Context = createWeb3Context(false, true)

// utils
function createSubscriptionFromSettings<T>(settings: InternalSettings<T>): Subscription<T> {
    const { trigger, subscribe } = getEventTarget()
    settings.readyPromise.finally(trigger)
    return {
        getCurrentValue: () => {
            if (!settings.ready) throw settings.readyPromise
            return settings.value
        },
        subscribe: (f) => {
            const a = subscribe(f)
            const b = settings.addListener(() => trigger())
            return () => void [a(), b()]
        },
    }
}

function createStaticSubscription<T>(getter: () => T) {
    return {
        getCurrentValue: getter,
        subscribe: () => noop,
    }
}

function createSubscriptionFromAsync<T>(
    f: () => Promise<T>,
    defaultValue: T,
    onChange: (callback: () => void) => () => void,
): Subscription<T> {
    // 0 - idle, 1 - updating state, > 1 - waiting state
    let beats = 0
    let state = defaultValue
    let isLoading = true
    const { subscribe, trigger } = getEventTarget()
    const init = f()
        .then((v) => {
            state = v
        })
        .finally(trigger)
        .finally(() => (isLoading = false))
    const flush = async () => {
        state = await f()
        beats -= 1
        if (beats > 0) {
            beats = 1
            setTimeout(flush, 0)
        } else if (beats < 0) {
            beats = 0
        }
        trigger()
    }
    return {
        getCurrentValue: () => {
            return state
        },
        subscribe: (sub) => {
            const a = subscribe(sub)
            const b = onChange(async () => {
                beats += 1
                if (beats === 1) await flush()
            })
            return () => void [a(), b()]
        },
    }
}
function getEventTarget() {
    const event = new EventTarget()
    const EVENT = 'event'
    let timer: NodeJS.Timeout
    function trigger() {
        clearTimeout(timer)
        // delay to update state to ensure that all settings to be synced globally
        timer = setTimeout(() => event.dispatchEvent(new Event(EVENT)), 600)
    }
    function subscribe(f: () => void) {
        event.addEventListener(EVENT, f)
        return () => event.removeEventListener(EVENT, f)
    }
    return { trigger, subscribe }
}
