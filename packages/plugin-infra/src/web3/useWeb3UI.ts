import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { useCurrentWeb3NetworkPluginID } from './Context'
import { useActivatedPluginWeb3UI } from '../hooks/useActivatedPluginWeb3UI'

export function useWeb3UI<T extends NetworkPluginID>(expectedPluginID?: T) {
    const pluginID = useCurrentWeb3NetworkPluginID(expectedPluginID) as T
    return useActivatedPluginWeb3UI(pluginID)
}
