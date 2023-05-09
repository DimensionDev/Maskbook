import type { NetworkPluginID } from '@masknet/shared-base'
import { Web3ConnectionAll } from '@masknet/web3-providers'
import type { Connection, ConnectionOptions } from '@masknet/web3-providers/types'
import { useNetworkContext } from './useContext.js'

export function useWeb3Connection<T extends NetworkPluginID = NetworkPluginID>(
    expectedPluginID?: T,
    options?: ConnectionOptions<T>,
) {
    const { pluginID } = useNetworkContext(expectedPluginID)
    return Web3ConnectionAll.use(pluginID, options) as Connection<T>
}
