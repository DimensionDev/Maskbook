import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { useNetworkContext } from './useContext.js'

export function useCurrentPluginID(expectedPluginID?: NetworkPluginID) {
    const { pluginID } = useNetworkContext()
    return expectedPluginID ?? pluginID!
}
