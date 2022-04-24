import { useNetworkType } from '@masknet/plugin-infra/src/web3'
import { NetworkPluginID } from '@masknet/plugin-infra/src/web3-types'
import { PLUGIN_NETWORKS } from '../constants'

export function useNetworkDescriptor() {
    const networkType = useNetworkType(NetworkPluginID.PLUGIN_EVM)
    return PLUGIN_NETWORKS.find((x) => x.type === networkType) ?? null
}
