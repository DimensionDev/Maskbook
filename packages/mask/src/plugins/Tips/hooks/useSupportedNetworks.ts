import { Icons, GeneratedIconProps } from '@masknet/icons'
import { NetworkPluginID } from '@masknet/web3-shared-base'
export interface SupportedNetworkMap {
    name: string
    icon: React.ComponentType<GeneratedIconProps>
}

export const networkMap: Record<NetworkPluginID, SupportedNetworkMap> = {
    [NetworkPluginID.PLUGIN_EVM]: { name: 'EVM Chain', icon: Icons.EvmChains },
    [NetworkPluginID.PLUGIN_FLOW]: { name: 'Solana Chain', icon: Icons.FlowIcon },
    [NetworkPluginID.PLUGIN_SOLANA]: { name: 'Flow Chain', icon: Icons.SolanaIcon },
}

// todo provide a function to support when Next.ID supports Flow and Solana
