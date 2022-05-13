import { NetworkPluginID } from '@masknet/web3-shared-base'
import { NetworkType as EVM_NetworkType } from '@masknet/web3-shared-evm'
// import { NetworkType as FlowNetworkType } from '@masknet/web3-shared-flow'
import { NetworkType as SolanaNetworkType } from '@masknet/web3-shared-solana'
import type { Web3Helper } from '../web3-helpers'
import { useCurrentWeb3NetworkPluginID } from './Context'

const DEFAULT_NETWORK_TYPE: Record<NetworkPluginID, Web3Helper.Definition[NetworkPluginID]['NetworkType']> = {
    [NetworkPluginID.PLUGIN_EVM]: EVM_NetworkType.Ethereum,
    // @ts-ignore
    [NetworkPluginID.PLUGIN_FLOW]: 'Flow',
    // [NetworkPluginID.PLUGIN_FLOW]: FlowNetworkType.Flow,
    [NetworkPluginID.PLUGIN_SOLANA]: SolanaNetworkType.Solana,
}

export function useDefaultNetworkType<T extends NetworkPluginID>(expectedPluginID?: T) {
    const pluginID = useCurrentWeb3NetworkPluginID(expectedPluginID) as T
    return DEFAULT_NETWORK_TYPE[pluginID]
}
