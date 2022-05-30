import { EMPTY_LIST } from '@masknet/shared-base'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { getPluginDefine } from '../manager/store'
import { useCurrentWeb3NetworkPluginID } from './Context'

export function useNetworkDescriptors<T extends NetworkPluginID>(expectedPluginID?: T) {
    const pluginID = useCurrentWeb3NetworkPluginID(expectedPluginID)
    return getPluginDefine(pluginID)?.declareWeb3Networks ?? EMPTY_LIST
}
