import { EMPTY_LIST } from '@masknet/shared-base'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { getPluginDefine } from '../manager/store'
import type { Web3Helper } from '../web3-helpers'
import { useCurrentWeb3NetworkPluginID } from './Context'

export function useNetworkDescriptors<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    expectedPluginID?: T,
) {
    type Result = S extends 'all' ? Web3Helper.NetworkDescriptorAll : Web3Helper.Web3NetworkDescriptor<T>

    const pluginID = useCurrentWeb3NetworkPluginID(expectedPluginID)
    return (getPluginDefine(pluginID)?.declareWeb3Networks ?? EMPTY_LIST) as Result[]
}
