import { noop } from 'lodash-es'
import type { Subscription } from 'use-subscription'
import type { provider as Web3Provider } from 'web3-core'
import type { MaskMessages } from '../../../maskbook/dist/utils/messages'
import type { Services as MaskServices } from '../../../maskbook/dist/extension/service'
import { ChainId, NetworkType, PortfolioProvider, ProviderType } from '..'
import type { Web3ProviderType } from '.'

export interface PluginServices {
    Wallet: typeof import('../../../maskbook/dist/plugins/Wallet/messages').WalletRPC
}
export interface PluginMessages {
    Wallet: typeof import('../../../plugins/Wallet/dist/messages').WalletMessages
}

export function createWeb3Context(
    provider: Web3Provider,
    hub: {
        MaskServices: typeof MaskServices
        MaskMessages: typeof MaskMessages
        PluginServices: PluginServices
        PluginMessages: PluginMessages
    },
): Web3ProviderType {
    return {
        provider: createStaticSubscription(() => provider),
        allowTestnet: createSubscriptionFromAsync(hub.MaskServices.Settings.getWalletAllowTestChain, false, () => {
            return () => {}
        }),
        account: createSubscriptionFromAsync(
            hub.MaskServices.Settings.getSelectedWalletAddress,
            '',
            hub.MaskMessages.events.currentAccountSettings.on,
        ),
        tokenPrices: createSubscriptionFromAsync(
            hub.MaskServices.Settings.getTokenPrices,
            {},
            hub.MaskMessages.events.currentTokenPricesSettings.on,
        ),
        balance: createSubscriptionFromAsync(
            hub.MaskServices.Settings.getBalance,
            '0',
            hub.MaskMessages.events.currentBalanceSettings.on,
        ),
        blockNumber: createSubscriptionFromAsync(
            hub.MaskServices.Settings.getBlockNumber,
            0,
            hub.MaskMessages.events.currentBlockNumberSettings.on,
        ),
        chainId: createSubscriptionFromAsync(
            hub.MaskServices.Settings.getChainId,
            ChainId.Mainnet,
            hub.MaskMessages.events.currentChainIdSettings.on,
        ),
        providerType: createSubscriptionFromAsync(
            hub.MaskServices.Settings.getCurrentSelectedWalletProvider,
            ProviderType.MaskWallet,
            hub.MaskMessages.events.currentProviderSettings.on,
        ),
        networkType: createSubscriptionFromAsync(
            hub.MaskServices.Settings.getCurrentSelectedWalletNetwork,
            NetworkType.Ethereum,
            hub.MaskMessages.events.currentNetworkSettings.on,
        ),
        walletPrimary: createSubscriptionFromAsync(
            hub.PluginServices.Wallet.getWalletPrimary,
            null,
            hub.PluginMessages.Wallet.events.walletsUpdated.on,
        ),
        wallets: createSubscriptionFromAsync(
            hub.PluginServices.Wallet.getWallets,
            [],
            hub.PluginMessages.Wallet.events.walletsUpdated.on,
        ),
        erc20Tokens: createSubscriptionFromAsync(
            hub.PluginServices.Wallet.getERC20Tokens,
            [],
            hub.PluginMessages.Wallet.events.erc20TokensUpdated.on,
        ),
        addERC20Token: hub.PluginServices.Wallet.addERC20Token,
        trustERC20Token: hub.PluginServices.Wallet.trustERC20Token,
        erc20TokensCount: createSubscriptionFromAsync(
            hub.PluginServices.Wallet.getERC20TokensCount,
            0,
            hub.PluginMessages.Wallet.events.erc20TokensUpdated.on,
        ),
        getERC20TokensPaged: hub.PluginServices.Wallet.getERC20TokensPaged,
        getERC721TokensPaged: hub.PluginServices.Wallet.getERC721TokensPaged,
        portfolioProvider: createSubscriptionFromAsync(
            hub.MaskServices.Settings.getCurrentPortfolioDataProvider,
            PortfolioProvider.DEBANK,
            hub.MaskMessages.events.currentPortfolioDataProviderSettings.on,
        ),
        getAssetsList: hub.PluginServices.Wallet.getAssetsList,
        getAssetsListNFT: hub.PluginServices.Wallet.getAssetsListNFT,
        getAddressNamesList: hub.PluginServices.Wallet.getAddressNames,
        getTransactionList: hub.PluginServices.Wallet.getTransactionList,
        fetchERC20TokensFromTokenLists: hub.MaskServices.Ethereum.fetchERC20TokensFromTokenLists,
        createMnemonicWords: hub.PluginServices.Wallet.createMnemonicWords,
    }
}

function createStaticSubscription<T>(getter: () => T) {
    return {
        getCurrentValue: getter,
        subscribe: () => noop,
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
