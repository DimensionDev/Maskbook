import type { Web3Plugin } from '@masknet/plugin-infra'
import {
    formatBalance,
    formatCurrency,
    formatEthereumAddress,
    getChainDetailed,
    isChainIdValid,
    NetworkType,
    PortfolioProvider,
    resolveAddressLinkOnExplorer,
    resolveBlockLinkOnExplorer,
    resolveChainColor,
    resolveChainFullName,
    resolveChainName,
    resolveTransactionLinkOnExplorer,
    Web3ProviderType,
} from '@masknet/web3-shared-evm'

export const Web3State: Web3Plugin.ObjectCapabilities.Capabilities = {}

export function fixWeb3State(state?: Web3Plugin.ObjectCapabilities.Capabilities, context?: Web3ProviderType) {
    if (!state || !context) return

    state.Shared = state.Shared ?? {
        allowTestnet: context.allowTestnet,
        chainId: context.chainId,
        account: context.account,
        balance: context.balance,
        blockNumber: context.blockNumber,
        networkType: context.networkType,
        providerType: context.providerType,
        walletPrimary: context.walletPrimary,
        wallets: context.wallets,
    }
    state.Asset = state.Asset ?? {
        getFungibleAssets: async (address, providerType, networkType, pagination) => {
            const assets = await context.getAssetsList(
                address,
                providerType as unknown as PortfolioProvider,
                networkType as NetworkType,
            )
            return assets.map((x) => ({
                id: x.token.address,
                chainId: x.token.chainId,
                balance: x.balance,
                price: x.price,
                value: x.value,
                logoURI: x.logoURI,
                token: {
                    ...x.token,
                    id: x.token.address,
                    chainId: x.token.chainId,
                },
            }))
        },
    }
    state.Utils = state.Utils ?? {
        getChainDetailed,
        isChainIdValid,

        formatAddress: formatEthereumAddress,
        formatCurrency,
        formatBalance,

        resolveChainName,
        resolveChainFullName,
        resolveChainColor,

        resolveTransactionLink: resolveTransactionLinkOnExplorer,
        resolveAddressLink: resolveAddressLinkOnExplorer,
        resolveBlockLink: resolveBlockLinkOnExplorer,
    }
    return state
}
