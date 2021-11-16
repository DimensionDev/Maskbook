import type { Web3Plugin } from '@masknet/plugin-infra'
import { formatBalance, formatCurrency, formatEthereumAddress, Web3ProviderType } from '@masknet/web3-shared-evm'

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
        formatAddress: formatEthereumAddress,
        formatCurrency,
        formatBalance,
    }
    return state
}
