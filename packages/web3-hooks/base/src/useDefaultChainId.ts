import { NetworkPluginID } from '@masknet/shared-base'
import { ChainId as EVM_ChainId } from '@masknet/web3-shared-evm'
import { ChainId as FlowChainId } from '@masknet/web3-shared-flow'
import { ChainId as SolanaChainId } from '@masknet/web3-shared-solana'
import type { Web3Helper } from '@masknet/web3-helpers'
import { usePluginContext } from './useContext.js'

const DEFAULT_CHAIN_ID: Record<NetworkPluginID, Web3Helper.Definition[NetworkPluginID]['ChainId']> = {
    [NetworkPluginID.PLUGIN_EVM]: EVM_ChainId.Mainnet,
    [NetworkPluginID.PLUGIN_FLOW]: FlowChainId.Mainnet,
    [NetworkPluginID.PLUGIN_SOLANA]: SolanaChainId.Mainnet,
}

export function useDefaultChainId<T extends NetworkPluginID>(expectedPluginID?: T) {
    const { pluginID } = usePluginContext<T>(expectedPluginID)
    return DEFAULT_CHAIN_ID[pluginID]
}
