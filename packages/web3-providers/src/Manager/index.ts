import { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { evm, solana } from './registry.js'

export { initWallet } from './io.js'
const all = {
    [NetworkPluginID.PLUGIN_EVM]: evm,
    [NetworkPluginID.PLUGIN_SOLANA]: solana,
} as const
/**
 * Get Web3 providers, for example, WalletConnect, MetaMask, etc.
 * @param ID Network name
 */
export function getRegisteredWeb3Providers<T extends NetworkPluginID>(
    ID: T,
): ReadonlyArray<Web3Helper.Web3ProviderDescriptor<T>>
export function getRegisteredWeb3Providers(
    ID: NetworkPluginID,
): ReadonlyArray<Web3Helper.Web3ProviderDescriptor<NetworkPluginID>> {
    return all[ID].provider
}

/**
 * Get Web3 Networks, for example, mainnet, testnet, Optimism, etc.
 * @param ID Network name
 */
export function getRegisteredWeb3Networks<T extends NetworkPluginID>(
    ID: T,
): ReadonlyArray<Web3Helper.Web3NetworkDescriptor<T>>
export function getRegisteredWeb3Networks(
    ID: NetworkPluginID,
): ReadonlyArray<Web3Helper.Web3NetworkDescriptor<NetworkPluginID>> {
    return all[ID].network
}

export function getRegisteredWeb3Chains<T extends NetworkPluginID>(
    ID: T,
): ReadonlyArray<Web3Helper.ChainDescriptorScope<void, T>> {
    return all[ID].chain
}
export function getAllPluginsWeb3State(): {
    [key in NetworkPluginID]: Web3Helper.Web3State<key>
} {
    return {
        [NetworkPluginID.PLUGIN_EVM]: evm.state!,
        [NetworkPluginID.PLUGIN_SOLANA]: solana.state!,
    }
}

export function getActivatedPluginWeb3State<T extends NetworkPluginID>(pluginID: T): Web3Helper.Web3State<T>
export function getActivatedPluginWeb3State(pluginID: NetworkPluginID): Web3Helper.Web3State<NetworkPluginID> {
    return all[pluginID].state!
}
