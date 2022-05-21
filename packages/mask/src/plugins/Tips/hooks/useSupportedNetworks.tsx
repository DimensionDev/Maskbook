import { NetworkPluginID } from '@masknet/web3-shared-base'
export interface SupportedNetworkMap {
    name: string
    icon: 'evmChains' | 'solana' | 'flow'
}

export const networkMap: Record<NetworkPluginID, SupportedNetworkMap> = {
    [NetworkPluginID.PLUGIN_EVM]: { name: 'EVM Chain', icon: 'evmChains' },
    [NetworkPluginID.PLUGIN_FLOW]: { name: 'Solana Chain', icon: 'solana' },
    [NetworkPluginID.PLUGIN_SOLANA]: { name: 'Flow Chain', icon: 'flow' },
}

// todo provide a function to support when Next.ID supports Flow and Solana
