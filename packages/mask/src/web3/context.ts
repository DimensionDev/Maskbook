import { noop } from 'lodash-unified'
import type { Subscription } from 'use-subscription'
import {
    ERC20TokenDetailed,
    ERC721TokenDetailed,
    ERC1155TokenDetailed,
    EthereumTokenType,
    ProviderType,
    Web3ProviderType,
    resolveProviderInjectedKey,
    isInjectedProvider,
    AddressNameType,
    createWeb3,
    ChainId,
    createContract,
    isSameAddress,
} from '@masknet/web3-shared-evm'
import { isPopupPage } from '@masknet/shared-base'
import { injectedCoin98Provider, injectedEthereumProvider } from '@masknet/injected-script'
import {
    currentAccountSettings,
    currentNetworkSettings,
    currentProviderSettings,
    currentChainIdSettings,
    currentFungibleAssetDataProviderSettings,
    currentTokenPricesSettings,
    currentMaskWalletChainIdSettings,
    currentMaskWalletNetworkSettings,
    currentMaskWalletAccountSettings,
} from '../plugins/Wallet/settings'
import { WalletMessages, WalletRPC } from '../plugins/Wallet/messages'
import type { InternalSettings } from '../settings/createSettings'
import { Flags, isAndroidApp } from '../../shared'
import Services from '../extension/service'
import { getProxyWebsocketInstance } from '@masknet/web3-shared-base'
import { TokenList, Twitter } from '@masknet/web3-providers'
import type { ERC721 } from '@masknet/web3-contracts/types/ERC721'
import type { AbiItem } from 'web3-utils'
import ERC721ABI from '@masknet/web3-contracts/abis/ERC721.json'
import CryptoPunks from '@masknet/web3-contracts/abis/CryptoPunks.json'

const PUNK_CONTRACT_ADDRESS = '0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb'
async function getTokenOwner(address: string, tokenId: string) {
    const web3 = createWeb3(EVM_RPC.request, () => ({
        chainId: ChainId.Mainnet,
    }))
    if (isSameAddress(address, PUNK_CONTRACT_ADDRESS)) {
        const PUNKContract = createContract(web3, PUNK_CONTRACT_ADDRESS, CryptoPunks as AbiItem[])
        return PUNKContract?.methods.punkIndexToAddress(tokenId).call()
    }
    const ERC721Contract = createContract<ERC721>(web3, address, ERC721ABI as AbiItem[])
    return ERC721Contract?.methods.ownerOf(tokenId).call()
}

function createWeb3Context(disablePopup = false, isMask = false): Web3ProviderType {
    return {
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

                if (isPopupPage()) return account
                if (providerType === ProviderType.Fortmatic) return account
                if (!isInjectedProvider(providerType)) return account

                try {
                    const injectedProvider =
                        providerType === ProviderType.Coin98 ? injectedCoin98Provider : injectedEthereumProvider
                    const injectedKey = resolveProviderInjectedKey(providerType)
                    if (!injectedKey) return ''
                    const propertyValue = await injectedProvider.getProperty(injectedKey)
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
        portfolioProvider: createSubscriptionFromSettings(currentFungibleAssetDataProviderSettings),

        addToken: WalletRPC.addToken,
        removeToken: WalletRPC.removeToken,
        trustToken: WalletRPC.trustToken,
        blockToken: WalletRPC.blockToken,

        request: EVM_RPC.request,
        getSendOverrides: () =>
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
        getRequestOptions: () => ({ popupsWindow: !disablePopup }),

        getAssetsList: WalletRPC.getAssetsList,
        getAssetsListNFT: WalletRPC.getAssetsListNFT,
        getCollectionsNFT: WalletRPC.getCollectionsNFT,
        getAddressNamesList: async (identity: Parameters<typeof WalletRPC.getAddressNames>[0]) => {
            const addressNames = await WalletRPC.getAddressNames(identity)
            if (identity.identifier.network === 'twitter.com') {
                const result = await Twitter.getUserNftContainer(identity.identifier.userId ?? '')
                if (result?.type_name.toUpperCase() === 'ERC721') {
                    const contractAddress = await getTokenOwner(result.address, result.token_id)
                    if (contractAddress)
                        return [
                            ...addressNames,
                            {
                                type: AddressNameType.TWITTER_BLUE,
                                label: contractAddress,
                                resolvedAddress: contractAddress,
                            },
                        ]
                }
            }
            return addressNames
        },
        getTransactionList: WalletRPC.getTransactionList,
        fetchERC20TokensFromTokenLists: TokenList.fetchFungibleTokensFromTokenLists,
        providerSocket: getProxyWebsocketInstance((info) => WalletMessages.events.socketMessageUpdated.sendToAll(info)),
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
        getCurrentValue: isAndroidApp
            ? () => state
            : () => {
                  if (isLoading) throw init
                  return state
              },
        subscribe: (sub) => {
            const a = subscribe(sub)
            const b = onChange(
                isAndroidApp
                    ? async () => {
                          beats += 1
                          if (beats === 1) await flush()
                      }
                    : () => {
                          beats += 1
                          if (beats === 1) flush()
                      },
            )
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
