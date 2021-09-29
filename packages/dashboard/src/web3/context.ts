import { noop } from 'lodash-es'
import type { Subscription } from 'use-subscription'
import { ChainId, PortfolioProvider, ProviderType } from '@masknet/web3-shared'
import { NetworkType, Web3ProviderType } from '@masknet/web3-shared'
import { Messages, PluginMessages, PluginServices, Services } from '../API'

const Web3Provider = createExternalProvider()

export const Web3Context: Web3ProviderType = {
    provider: {
        getCurrentValue: () => Web3Provider,
        subscribe: () => noop,
    },
    allowTestnet: createSubscriptionFromAsync(Services.Settings.getWalletAllowTestChain, false, () => {
        return () => {}
    }),
    account: createSubscriptionFromAsync(
        Services.Settings.getSelectedWalletAddress,
        '',
        Messages.events.currentAccountSettings.on,
    ),
    tokenPrices: createSubscriptionFromAsync(
        Services.Settings.getTokenPrices,
        {},
        Messages.events.currentTokenPricesSettings.on,
    ),
    balance: createSubscriptionFromAsync(Services.Settings.getBalance, '0', Messages.events.currentBalanceSettings.on),
    blockNumber: createSubscriptionFromAsync(
        Services.Settings.getBlockNumber,
        0,
        Messages.events.currentBlockNumberSettings.on,
    ),
    chainId: createSubscriptionFromAsync(
        Services.Settings.getChainId,
        ChainId.Mainnet,
        Messages.events.currentChainIdSettings.on,
    ),
    providerType: createSubscriptionFromAsync(
        Services.Settings.getCurrentSelectedWalletProvider,
        ProviderType.MaskWallet,
        Messages.events.currentProviderSettings.on,
    ),
    networkType: createSubscriptionFromAsync(
        Services.Settings.getCurrentSelectedWalletNetwork,
        NetworkType.Ethereum,
        Messages.events.currentNetworkSettings.on,
    ),
    walletPrimary: createSubscriptionFromAsync(
        PluginServices.Wallet.getWalletPrimary,
        null,
        PluginMessages.Wallet.events.walletsUpdated.on,
    ),
    wallets: createSubscriptionFromAsync(
        PluginServices.Wallet.getWallets,
        [],
        PluginMessages.Wallet.events.walletsUpdated.on,
    ),
    erc20Tokens: createSubscriptionFromAsync(
        PluginServices.Wallet.getERC20Tokens,
        [],
        PluginMessages.Wallet.events.erc20TokensUpdated.on,
    ),
    addERC20Token: PluginServices.Wallet.addERC20Token,
    trustERC20Token: PluginServices.Wallet.trustERC20Token,
    erc20TokensCount: createSubscriptionFromAsync(
        PluginServices.Wallet.getERC20TokensCount,
        0,
        PluginMessages.Wallet.events.erc20TokensUpdated.on,
    ),
    getERC20TokensPaged: PluginServices.Wallet.getERC20TokensPaged,
    getERC721TokensPaged: PluginServices.Wallet.getERC721TokensPaged,
    portfolioProvider: createSubscriptionFromAsync(
        Services.Settings.getCurrentPortfolioDataProvider,
        PortfolioProvider.DEBANK,
        Messages.events.currentPortfolioDataProviderSettings.on,
    ),
    getAssetsList: PluginServices.Wallet.getAssetsList,
    getAssetsListNFT: PluginServices.Wallet.getAssetsListNFT,
    getAddressNamesList: PluginServices.Wallet.getAddressNames,
    getTransactionList: PluginServices.Wallet.getTransactionList,
    fetchERC20TokensFromTokenLists: Services.Ethereum.fetchERC20TokensFromTokenLists,
    createMnemonicWords: PluginServices.Wallet.createMnemonicWords,
    getNonce: Services.Ethereum.getNonce,
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

// double check
function createSubscriptionFromAsync<T>(
    f: () => Promise<T>,
    defaultValue: T,
    onChange: (callback: () => void) => () => void,
): Subscription<T> {
    // 0 - idle, 1 - updating state, > 1 - waiting state
    let beats = 0
    let state = defaultValue
    const { subscribe, trigger } = getEventTarget()
    f()
        .then((v) => (state = v))
        .finally(trigger)
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
        getCurrentValue: () => state,
        subscribe: (sub) => {
            const a = subscribe(sub)
            const b = onChange(async () => {
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
