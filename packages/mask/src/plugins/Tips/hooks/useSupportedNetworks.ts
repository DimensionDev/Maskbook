import { Icons, type GeneratedIconProps } from '@masknet/icons'
import { NetworkPluginID } from '@masknet/shared-base'
export interface SupportedNetworkMap {
    name: string
    icon: React.ComponentType<GeneratedIconProps>
}

export const networkMap: Record<NetworkPluginID, SupportedNetworkMap> = {
    [NetworkPluginID.PLUGIN_EVM]: { name: 'EVM Chain', icon: Icons.EVMChains },
    [NetworkPluginID.PLUGIN_FLOW]: { name: 'Solana Chain', icon: Icons.Flow },
    [NetworkPluginID.PLUGIN_SOLANA]: { name: 'Flow Chain', icon: Icons.Solana },
}
