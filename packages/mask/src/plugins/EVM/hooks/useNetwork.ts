import { useNetworkType } from '@masknet/web3-shared-evm'
import { PLUGIN_NETWORKS } from '../constants'

export function useNetwork() {
    const networkType = useNetworkType()
    return PLUGIN_NETWORKS.find((x) => x.type === networkType) ?? null
}
