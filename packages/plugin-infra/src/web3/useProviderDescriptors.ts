import { EMPTY_LIST } from '@masknet/shared-base'
import { useCurrentWeb3NetworkPluginID } from '.'
import { getPluginDefine } from '../entry'
import type { NetworkPluginID } from '../web3-types'

export function useProviderDescriptors<T extends NetworkPluginID>(expectedPluginID?: T) {
    const pluginID = useCurrentWeb3NetworkPluginID(expectedPluginID)
    return getPluginDefine(pluginID)?.declareWeb3Providers ?? EMPTY_LIST
}
