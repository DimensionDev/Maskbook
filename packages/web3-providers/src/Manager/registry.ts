import type { NetworkPluginID } from '@masknet/shared-base'
import {
    CHAIN_DESCRIPTORS as evm_chain,
    NETWORK_DESCRIPTORS as evm_network,
    PROVIDER_DESCRIPTORS as evm_providers,
} from '@masknet/web3-shared-evm'
import {
    CHAIN_DESCRIPTORS as flow_chain,
    NETWORK_DESCRIPTORS as flow_network,
    PROVIDER_DESCRIPTORS as flow_providers,
} from '@masknet/web3-shared-flow'
import {
    CHAIN_DESCRIPTORS as solana_chain,
    NETWORK_DESCRIPTORS as solana_network,
    PROVIDER_DESCRIPTORS as solana_providers,
} from '@masknet/web3-shared-solana'
import type { Web3Helper } from '@masknet/web3-helpers'

export interface NetworkPlugin<T extends NetworkPluginID> {
    readonly chain: ReadonlyArray<Web3Helper.ChainDescriptorScope<void, T>>
    readonly network: ReadonlyArray<Web3Helper.Web3NetworkDescriptor<T>>
    readonly provider: ReadonlyArray<Web3Helper.Web3ProviderDescriptor<T>>
    state: Web3Helper.Web3State<T>
}
export const evm: NetworkPlugin<NetworkPluginID.PLUGIN_EVM> = {
    chain: evm_chain,
    network: evm_network,
    provider: evm_providers,
    state: null!,
}
export const flow: NetworkPlugin<NetworkPluginID.PLUGIN_FLOW> = {
    chain: flow_chain,
    network: flow_network,
    provider: flow_providers,
    state: null!,
}
export const solana: NetworkPlugin<NetworkPluginID.PLUGIN_SOLANA> = {
    chain: solana_chain,
    network: solana_network,
    provider: solana_providers,
    state: null!,
}
