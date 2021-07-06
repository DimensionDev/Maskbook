import { pick, noop } from 'lodash-es'
import type { Subscription } from 'use-subscription'
import { ChainId, createERC721Token, PortfolioProvider, ProviderType } from '@masknet/web3-shared'
import { ERC20TokenDetailed, EthereumTokenType, NetworkType, Wallet, Web3ProviderType } from '@masknet/web3-shared'
import { Messages, PluginMessages, PluginServices, Services } from '../API'

const Web3Provider = createExternalProvider()

export const Web3Context: Web3ProviderType = {
    provider: {
        getCurrentValue: () => Web3Provider,
        subscribe: () => noop,
    },
    allowTestnet: createSubscriptionAsync(Services.Settings.getWalletAllowTestChain, false, () => {
        return () => {}
    }),
    account: createSubscriptionAsync(
        Services.Settings.getSelectedWalletAddress,
        '',
        Messages.events.currentAccountSettings.on,
    ),
    nonce: createSubscriptionAsync(Services.Settings.getBlockNumber, 0, Messages.events.currentBlockNumberSettings.on),
    gasPrice: createSubscriptionAsync(
        Services.Settings.getBlockNumber,
        0,
        Messages.events.currentBlockNumberSettings.on,
    ),
    balance: createSubscriptionAsync(Services.Settings.getBalance, '0', Messages.events.currentBalanceSettings.on),
    blockNumber: createSubscriptionAsync(
        Services.Settings.getBlockNumber,
        0,
        Messages.events.currentBlockNumberSettings.on,
    ),
    chainId: createSubscriptionAsync(
        Services.Settings.getChainId,
        ChainId.Mainnet,
        Messages.events.currentChainIdSettings.on,
    ),
    providerType: createSubscriptionAsync(
        Services.Settings.getCurrentSelectedWalletProvider,
        ProviderType.Maskbook,
        Messages.events.currentProviderSettings.on,
    ),
    networkType: createSubscriptionAsync(
        Services.Settings.getCurrentSelectedWalletNetwork,
        NetworkType.Ethereum,
        Messages.events.currentNetworkSettings.on,
    ),
    wallets: createSubscriptionAsync(getWallets, [], PluginMessages.Wallet.events.walletsUpdated.on),
    erc20Tokens: createSubscriptionAsync(getERC20Tokens, [], PluginMessages.Wallet.events.erc20TokensUpdated.on),
    erc20TokensCount: createSubscriptionAsync(
        PluginServices.Wallet.getERC20TokensCount,
        0,
        PluginMessages.Wallet.events.erc20TokensUpdated.on,
    ),
    getERC20TokensPaged,
    portfolioProvider: createSubscriptionAsync(
        Services.Settings.getCurrentPortfolioDataProvider,
        PortfolioProvider.DEBANK,
        Messages.events.currentPortfolioDataProviderSettings.on,
    ),
    getAssetList: PluginServices.Wallet.getAssetsList,
    getAssetsListNFT: PluginServices.Wallet.getAssetsListNFT,
    getERC721TokensPaged,
    fetchERC20TokensFromTokenLists: Services.Ethereum.fetchERC20TokensFromTokenLists,
    createMnemonicWords: PluginServices.Wallet.createMnemonicWords,
}

export function createExternalProvider() {
    return {
        isMetaMask: false,
        isStatus: true,
        host: '',
        path: '',
        request: Services.Ethereum.request,
        send: Services.Ethereum.requestSend,
        sendAsync: Services.Ethereum.requestSend,
    }
}

async function getWallets() {
    const raw = await PluginServices.Wallet.getWallets()
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
    const raw = await PluginServices.Wallet.getERC20Tokens()
    return raw.map<ERC20TokenDetailed>((x) => ({
        type: EthereumTokenType.ERC20,
        ...x,
    }))
}

async function getERC20TokensPaged(index: number, count: number, query?: string) {
    const raw = await PluginServices.Wallet.getERC20TokensPaged(index, count, query)
    return raw.map<ERC20TokenDetailed>((x) => ({
        type: EthereumTokenType.ERC20,
        ...x,
    }))
}

async function getERC721TokensPaged(index: number, count: number, query?: string) {
    const raw = await PluginServices.Wallet.getERC721TokensPaged(index, count, query)
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
