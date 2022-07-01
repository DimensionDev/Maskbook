import { EvmChains as EVMChainsIcon, Solana as SolanaIcon, Flow as FlowIcon, GeneratedIconProps } from '@masknet/icons'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import type { ComponentType } from 'react'
export interface SupportedNetworkMap {
    name: string
    icon: ComponentType<GeneratedIconProps<never>>
}

export const networkMap: Record<NetworkPluginID, SupportedNetworkMap> = {
    [NetworkPluginID.PLUGIN_EVM]: { name: 'EVM Chain', icon: EVMChainsIcon },
    [NetworkPluginID.PLUGIN_FLOW]: { name: 'Solana Chain', icon: FlowIcon },
    [NetworkPluginID.PLUGIN_SOLANA]: { name: 'Flow Chain', icon: SolanaIcon },
}

// todo provide a function to support when Next.ID supports Flow and Solana
