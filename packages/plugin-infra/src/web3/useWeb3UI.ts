import { useCurrentWeb3NetworkPluginID } from './Context'
import { useActivatedPluginWeb3UI } from '../hooks/useActivatedPluginWeb3UI'
import type { NetworkPluginID } from '../web3-types'

export function useWeb3UI(expectedPluginID?: NetworkPluginID) {
    const pluginID = useCurrentWeb3NetworkPluginID()
    return useActivatedPluginWeb3UI(expectedPluginID ?? pluginID) ?? {}
}
