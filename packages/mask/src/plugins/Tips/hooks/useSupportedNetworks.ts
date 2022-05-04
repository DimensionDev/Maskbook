import { NetworkPluginID } from '@masknet/plugin-infra/web3'
import { EVMChainsIcon, SolanaIcon, FlowIcon } from '@masknet/icons'
import type { OverridableComponent } from '@mui/material/OverridableComponent'
import type { SvgIconTypeMap } from '@mui/material'

export function useSupportedNetworks(keys: NetworkPluginID[]) {
    // todo support solana flow when NextID supported
    const networkMap: Record<NetworkPluginID, { name: string; icon: OverridableComponent<SvgIconTypeMap<{}, 'svg'>> }> =
        {
            [NetworkPluginID.PLUGIN_EVM]: { name: 'EVM Chian', icon: EVMChainsIcon },
            [NetworkPluginID.PLUGIN_FLOW]: { name: 'Solana Chain', icon: FlowIcon },
            [NetworkPluginID.PLUGIN_SOLANA]: { name: 'Flow Chain', icon: SolanaIcon },
        }
    return keys.reduce((res: Array<{ name: string; icon: OverridableComponent<SvgIconTypeMap<{}, 'svg'>> }>, x) => {
        res.push(networkMap[x])
        return res
    }, [])
}
