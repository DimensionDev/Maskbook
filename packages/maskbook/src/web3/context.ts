import { noop, pick } from 'lodash-es'
import type { Subscription } from 'use-subscription'
import {
    createERC721Token,
    ERC20TokenDetailed,
    EthereumTokenType,
    Wallet,
    Web3ProviderType,
} from '@masknet/web3-shared'
import { WalletMessages, WalletRPC } from '../plugins/Wallet/messages'
import {
    currentBlockNumberSettings,
    currentGasPriceSettings,
    currentBalanceSettings,
    currentNonceSettings,
    currentAccountSettings,
    currentNetworkSettings,
    currentProviderSettings,
    currentChainIdSettings,
    currentPortfolioDataProviderSettings,
} from '../plugins/Wallet/settings'
import { Flags } from '../utils'
import type { InternalSettings } from '../settings/createSettings'
import { createExternalProvider } from './helpers'
import Services from '../extension/service'

const Web3Provider = createExternalProvider()

export const Web3Context: Web3ProviderType = {
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
    balance: createSubscriptionFromSettings(currentBalanceSettings),
    blockNumber: createSubscriptionFromSettings(currentBlockNumberSettings),
    nonce: createSubscriptionFromSettings(currentNonceSettings),
    gasPrice: createSubscriptionFromSettings(currentGasPriceSettings),
    wallets: createSubscriptionAsync(getWallets, [], WalletMessages.events.walletsUpdated.on),
    providerType: createSubscriptionFromSettings(currentProviderSettings),
    networkType: createSubscriptionFromSettings(currentNetworkSettings),
    erc20Tokens: createSubscriptionAsync(getERC20Tokens, [], WalletMessages.events.erc20TokensUpdated.on),
    erc20TokensCount: createSubscriptionAsync(
        WalletRPC.getERC20TokensCount,
        0,
        WalletMessages.events.erc20TokensUpdated.on,
    ),
    getERC20TokensPaged,
    portfolioProvider: createSubscriptionFromSettings(currentPortfolioDataProviderSettings),
    getAssetList: WalletRPC.getAssetsList,
    getAssetsListNFT: WalletRPC.getAssetsListNFT,
    getERC721TokensPaged,
    fetchERC20TokensFromTokenLists: Services.Ethereum.fetchERC20TokensFromTokenLists,
    createMnemonicWords: WalletRPC.createMnemonicWords,
}

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
    const raw = await WalletRPC.getERC721TokensPaged(index, count, query)
    return raw.map((x) =>
        createERC721Token(x.chainId, x.tokenId, x.address, x.name, x.symbol, x.baseURI, x.tokenURI, {
            name: x.assetName,
            description: x.assetDescription,
            image: x.assetImage,
        }),
    )
}

async function getERC721Tokens() {
    return []
}

// utils
function createSubscriptionFromSettings<T>(settings: InternalSettings<T>): Subscription<T> {
    const { trigger, subscribe } = getEventTarget()
    settings.readyPromise.finally(trigger)
    return {
        getCurrentValue: () => settings.value,
        subscribe: (f) => {
            const a = subscribe(f)
            const b = settings.addListener(() => trigger())
            return () => void [a(), b()]
        },
    }
}
function createSubscriptionAsync<T>(
    f: () => Promise<T>,
    defaultValue: T,
    onChange: (callback: () => void) => () => void,
): Subscription<T> {
    let state = defaultValue
    const { subscribe, trigger } = getEventTarget()
    f()
        .then((v) => (state = v))
        .finally(trigger)
    return {
        getCurrentValue: () => state,
        subscribe: (sub) => {
            const a = subscribe(sub)
            const b = onChange(async () => {
                state = await f()
                sub()
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
