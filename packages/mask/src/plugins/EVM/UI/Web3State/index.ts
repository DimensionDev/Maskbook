import type { Web3Plugin } from '@masknet/plugin-infra'
import {
    formatBalance,
    formatCurrency,
    formatEthereumAddress,
    getChainDetailed,
    isChainIdValid,
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
        account: context.account,
        balance: context.balance,
        blockNumber: context.blockNumber,
        chainId: context.chainId,
        networkType: context.networkType,
        providerType: context.providerType,
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
