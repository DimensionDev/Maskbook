import { noop, omit } from 'lodash-es'
import type { Subscription } from 'use-subscription'
import { ERC20TokenDetailed, EthereumTokenType, ProviderType, Web3ProviderType } from '@masknet/web3-shared'
import { WalletMessages, WalletRPC } from '../plugins/Wallet/messages'
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
    currentAccountMaskWalletSettings,
    currentMaskWalletBalanceSettings,
} from '../plugins/Wallet/settings'
import { Flags } from '../utils'
import type { InternalSettings } from '../settings/createSettings'
import { createExternalProvider } from './helpers'
import Services from '../extension/service'

function createWeb3Context(disablePopup = false, isMask = false): Web3ProviderType {
    const Web3Provider = createExternalProvider(disablePopup)
    return {
        provider: createStaticSubscription(() => Web3Provider),
        allowTestnet: createStaticSubscription(() => Flags.wallet_allow_testnet),
        chainId: createSubscriptionFromSettings(isMask ? currentMaskWalletChainIdSettings : currentChainIdSettings),
        account: createSubscriptionFromSettings(isMask ? currentAccountMaskWalletSettings : currentAccountSettings),
        balance: createSubscriptionFromSettings(isMask ? currentMaskWalletBalanceSettings : currentBalanceSettings),
        blockNumber: createSubscriptionFromSettings(currentBlockNumberSettings),
        tokenPrices: createSubscriptionFromSettings(currentTokenPricesSettings),
        walletPrimary: createSubscriptionFromAsync(getWalletPrimary, null, WalletMessages.events.walletsUpdated.on),
        wallets: createSubscriptionFromAsync(getWallets, [], WalletMessages.events.walletsUpdated.on),
        providerType: isMask
            ? createStaticSubscription(() => ProviderType.MaskWallet)
            : createSubscriptionFromSettings(currentProviderSettings),
        networkType: createSubscriptionFromSettings(isMask ? currentMaskWalletNetworkSettings : currentNetworkSettings),
        erc20Tokens: createSubscriptionFromAsync(getERC20Tokens, [], WalletMessages.events.erc20TokensUpdated.on),
        erc20TokensCount: createSubscriptionFromAsync(
            WalletRPC.getERC20TokensCount,
            0,
            WalletMessages.events.erc20TokensUpdated.on,
        ),
        portfolioProvider: createSubscriptionFromSettings(currentPortfolioDataProviderSettings),
        addERC20Token: WalletRPC.addERC20Token,
        trustERC20Token: WalletRPC.trustERC20Token,
        getERC20TokensPaged,
        getAssetsList: WalletRPC.getAssetsList,
        getAssetsListNFT: WalletRPC.getAssetsListNFT,
        getAddressNamesList: WalletRPC.getAddressNames,
        getERC721TokensPaged,
        fetchERC20TokensFromTokenLists: Services.Ethereum.fetchERC20TokensFromTokenLists,
        getTransactionList: WalletRPC.getTransactionList,
        createMnemonicWords: WalletRPC.createMnemonicWords,
        getNonce: Services.Ethereum.getNonce,
    }
}

export const Web3Context = createWeb3Context()
export const PopupWeb3Context = createWeb3Context(true, true)
export const SwapWeb3Context = createWeb3Context(false, true)

async function getWallets() {
    const wallets = await WalletRPC.getWallets()
    return wallets.map((x) => ({
        ...omit(x, 'derivationPath', 'storedKeyInfo'),
        hasStoredKeyInfo: !!x.storedKeyInfo,
        hasDerivationPath: !!x.derivationPath,
    }))
}

export async function getWalletPrimary() {
    const wallet = await WalletRPC.getWalletPrimary()
    if (!wallet) return null
    return {
        ...omit(wallet, 'derivationPath', 'storedKeyInfo'),
        hasStoredKeyInfo: !!wallet.storedKeyInfo,
        hasDerivationPath: !!wallet.derivationPath,
    }
}

async function getERC20Tokens() {
    const raw = await WalletRPC.getERC20Tokens()
    return raw.map<ERC20TokenDetailed>((x) => ({
        type: EthereumTokenType.ERC20,
        ...x,
    }))
}

async function getERC20TokensPaged(index: number, count: number, query?: string) {
    const raw = await WalletRPC.getERC20TokensPaged(index, count, query)
    return raw.map<ERC20TokenDetailed>((x) => ({
        type: EthereumTokenType.ERC20,
        ...x,
    }))
}

async function getERC721TokensPaged(index: number, count: number, query?: string) {
    return WalletRPC.getERC721TokensPaged(index, count, query)
}

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
            if (isLoading) throw init
            return state
        },
        subscribe: (sub) => {
            const a = subscribe(sub)
            const b = onChange(() => {
                beats += 1
                if (beats === 1) flush()
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
