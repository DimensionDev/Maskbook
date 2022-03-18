import type { Subscription } from 'use-subscription'
import {
    ChainId,
    ERC1155TokenDetailed,
    ERC721TokenDetailed,
    FungibleAssetProvider,
    ProviderType,
    ERC20TokenDetailed,
    EthereumTokenType,
    NetworkType,
    Web3ProviderType,
} from '@masknet/web3-shared-evm'
import { getProxyWebsocketInstance } from '@masknet/web3-shared-base'
import { Services, Messages, PluginServices, PluginMessages } from '../API'
import { TokenList } from '@masknet/web3-providers'
import { EVM_RPC } from '@masknet/plugin-evm/src/messages'

export const Web3Context: Web3ProviderType = {
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
        () => PluginServices.Wallet.getTokens<ERC20TokenDetailed>(EthereumTokenType.ERC20),
        [],
        PluginMessages.Wallet.events.erc20TokensUpdated.on,
    ),
    erc721Tokens: createSubscriptionFromAsync(
        () => PluginServices.Wallet.getTokens<ERC721TokenDetailed>(EthereumTokenType.ERC721),
        [],
        PluginMessages.Wallet.events.erc721TokensUpdated.on,
    ),
    erc1155Tokens: createSubscriptionFromAsync(
        () => PluginServices.Wallet.getTokens<ERC1155TokenDetailed>(EthereumTokenType.ERC1155),
        [],
        PluginMessages.Wallet.events.erc1155TokensUpdated.on,
    ),
    portfolioProvider: createSubscriptionFromAsync(
        Services.Settings.getCurrentPortfolioDataProvider,
        FungibleAssetProvider.DEBANK,
        Messages.events.currentFungibleAssetDataProviderSettings.on,
    ),

    addToken: PluginServices.Wallet.addToken,
    removeToken: PluginServices.Wallet.removeToken,
    trustToken: PluginServices.Wallet.trustToken,
    blockToken: PluginServices.Wallet.blockToken,

    request: EVM_RPC.request,

    getAssetsList: PluginServices.Wallet.getAssetsList,
    getAssetsListNFT: PluginServices.Wallet.getAssetsListNFT,
    getCollectionsNFT: PluginServices.Wallet.getCollectionsNFT,
    getAddressNamesList: PluginServices.Wallet.getAddressNames,
    getTransactionList: PluginServices.Wallet.getTransactionList,
    fetchERC20TokensFromTokenLists: TokenList.fetchERC20TokensFromTokenLists,
    providerSocket: getProxyWebsocketInstance((info) =>
        PluginMessages.Wallet.events.socketMessageUpdated.sendToAll(info),
    ),
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
    let timer: ReturnType<typeof setTimeout>
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
