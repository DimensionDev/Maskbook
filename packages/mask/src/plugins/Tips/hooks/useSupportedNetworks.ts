import { EVMChainsIcon, SolanaIcon, FlowIcon } from '@masknet/icons'
import type { OverridableComponent } from '@mui/material/OverridableComponent'
import type { SvgIconTypeMap } from '@mui/material'
import { NetworkPluginID } from '@masknet/public-api'

export interface SupportedNetworkMap {
    name: string
    icon: OverridableComponent<SvgIconTypeMap<{}, 'svg'>>
}

export const networkMap: Record<NetworkPluginID, SupportedNetworkMap> = {
    [NetworkPluginID.PLUGIN_EVM]: { name: 'EVM Chain', icon: EVMChainsIcon },
    [NetworkPluginID.PLUGIN_FLOW]: { name: 'Solana Chain', icon: FlowIcon },
    [NetworkPluginID.PLUGIN_SOLANA]: { name: 'Flow Chain', icon: SolanaIcon },
}

// todo provide a function to support when Next.ID supports Flow and Solana
