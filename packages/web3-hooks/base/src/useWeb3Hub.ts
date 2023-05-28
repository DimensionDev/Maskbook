import type { NetworkPluginID } from '@masknet/shared-base'
import { HubAll } from '@masknet/web3-providers'
import type { Hub, HubOptions } from '@masknet/web3-providers/types'
import { useNetworkContext } from './useContext.js'

export function useWeb3Hub<T extends NetworkPluginID = NetworkPluginID>(expectedPluginID?: T, options?: HubOptions<T>) {
    const { pluginID } = useNetworkContext(expectedPluginID)
    return HubAll.use(pluginID, options) as Hub<T>
}
