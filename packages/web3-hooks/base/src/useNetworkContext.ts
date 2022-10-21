import type { NetworkPluginID } from '@masknet/shared-base'
import { useNetworkContext } from './useContext.js'

export function useCurrentWeb3NetworkPluginID(expectedPluginID?: NetworkPluginID) {
    const { pluginID } = useNetworkContext()
    return expectedPluginID ?? pluginID!
}
