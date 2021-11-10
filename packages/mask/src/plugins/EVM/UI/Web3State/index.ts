import type { Plugin } from '@masknet/plugin-infra'
import type { Web3ProviderType } from '@masknet/web3-shared-evm'

export const Web3State: Plugin.Shared.Web3State = {}

export function fixWeb3State(state?: Plugin.Shared.Web3State, context?: Web3ProviderType) {
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
    return state
}
