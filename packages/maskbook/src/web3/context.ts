import { noop, pick } from 'lodash-es'
import type { Subscription } from 'use-subscription'
import { ERC20TokenDetailed, EthereumTokenType, Wallet, Web3ProviderType } from '@masknet/web3-shared'
import { WalletMessages, WalletRPC } from '../plugins/Wallet/messages'
import {
    currentBlockNumberSettings,
    currentBalanceSettings,
    currentNonceSettings,
    currentAccountSettings,
    currentGasPriceSettings,
    currentNetworkSettings,
    currentProviderSettings,
    currentChainIdSettings,
    currentPortfolioDataProviderSettings,
    currentEtherPriceSettings,
    currentTokenPricesSettings,
    currentMaskWalletChainIdSettings,
    currentMaskWalletNetworkSettings,
    currentAccountMaskWalletSettings,
} from '../plugins/Wallet/settings'
import { Flags } from '../utils'
import type { InternalSettings } from '../settings/createSettings'
import { createExternalProvider } from './helpers'
import Services from '../extension/service'

function createWeb3Context(disablePopup = false): Web3ProviderType {
    const Web3Provider = createExternalProvider(disablePopup)
    return {
        provider: {
            getCurrentValue: () => Web3Provider,
            subscribe: () => noop,
        },
        allowTestnet: {
            getCurrentValue: () => Flags.wallet_allow_testnet,
            subscribe: () => noop,
        },
        chainId: createSubscriptionFromSettings(currentChainIdSettings),
        account: createSubscriptionFromSettings(currentAccountSettings),
        accountMaskWallet: createSubscriptionFromSettings(currentAccountMaskWalletSettings),
        maskWalletChainId: createSubscriptionFromSettings(currentMaskWalletChainIdSettings),
        balance: createSubscriptionFromSettings(currentBalanceSettings),
        gasPrice: createSubscriptionFromSettings(currentGasPriceSettings),
        blockNumber: createSubscriptionFromSettings(currentBlockNumberSettings),
        nonce: createSubscriptionFromSettings(currentNonceSettings),
        etherPrice: createSubscriptionFromSettings(currentEtherPriceSettings),
        tokenPrices: createSubscriptionFromSettings(currentTokenPricesSettings),
        wallets: createSubscriptionFromAsync(getWallets, [], WalletMessages.events.walletsUpdated.on),
        providerType: createSubscriptionFromSettings(currentProviderSettings),
        networkType: createSubscriptionFromSettings(currentNetworkSettings),
        maskWalletNetworkType: createSubscriptionFromSettings(currentMaskWalletNetworkSettings),
        erc20Tokens: createSubscriptionFromAsync(getERC20Tokens, [], WalletMessages.events.erc20TokensUpdated.on),
        erc20TokensCount: createSubscriptionFromAsync(
            WalletRPC.getERC20TokensCount,
            0,
            WalletMessages.events.erc20TokensUpdated.on,
        ),
        addERC20Token: WalletRPC.addERC20Token,
        trustERC20Token: WalletRPC.trustERC20Token,
        getERC20TokensPaged,
        portfolioProvider: createSubscriptionFromSettings(currentPortfolioDataProviderSettings),
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
export const Web3ContextWithoutConfirm = createWeb3Context(true)

async function getWallets() {
    const raw = await WalletRPC.getWallets()
    return raw.map<Wallet>((record) => ({
        ...pick(record, [
            'address',
            'name',
            'erc1155_token_whitelist',
            'erc1155_token_blacklist',
            'erc20_token_whitelist',
            'erc20_token_blacklist',
            'erc721_token_whitelist',
            'erc721_token_blacklist',
        ] as (keyof typeof record)[]),
        hasPrivateKey: Boolean(record._private_key_ || record.mnemonic.length),
    }))
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
