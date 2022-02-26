import { useCurrentWeb3NetworkPluginID } from '.'
import { getPluginDefine } from '../entry'
import type { NetworkPluginID } from '../web3-types'

export function useProviderDescriptors(expectedPluginID?: NetworkPluginID) {
    const pluginID = useCurrentWeb3NetworkPluginID(expectedPluginID)
    return getPluginDefine(pluginID)?.declareWeb3Providers ?? []
}
