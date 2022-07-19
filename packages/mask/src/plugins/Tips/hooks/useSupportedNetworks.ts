import { EvmChains, SolanaIcon, FlowIcon, GeneratedIconProps } from '@masknet/icons'
import { NetworkPluginID } from '@masknet/web3-shared-base'
export interface SupportedNetworkMap {
    name: string
    icon: React.ComponentType<GeneratedIconProps>
}

export const networkMap: Record<NetworkPluginID, SupportedNetworkMap> = {
    [NetworkPluginID.PLUGIN_EVM]: { name: 'EVM Chain', icon: EvmChains },
    [NetworkPluginID.PLUGIN_FLOW]: { name: 'Solana Chain', icon: FlowIcon },
    [NetworkPluginID.PLUGIN_SOLANA]: { name: 'Flow Chain', icon: SolanaIcon },
}

// todo provide a function to support when Next.ID supports Flow and Solana
