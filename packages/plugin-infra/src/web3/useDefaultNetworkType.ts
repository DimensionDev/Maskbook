import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { useWeb3State } from './useWeb3State'

export function useDefaultNetworkType<T extends NetworkPluginID>(pluginID?: T) {
    const { Others } = useWeb3State(pluginID)
    const networkType = Others?.getDefaultNetworkType()

    if (!networkType) throw new Error('No default network type.')
    return networkType
}
