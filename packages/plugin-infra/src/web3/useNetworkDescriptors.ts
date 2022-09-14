import { EMPTY_LIST } from '@masknet/shared-base'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { getPluginDefine } from '../manager/store.js'
import type { PluginID } from '../types.js'
import type { Web3Helper } from '../web3-helpers/index.js'
import { useCurrentWeb3NetworkPluginID } from './Context.js'

export function useNetworkDescriptors<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    expectedPluginID?: T,
) {
    const pluginID = useCurrentWeb3NetworkPluginID(expectedPluginID)
    return (getPluginDefine(pluginID as unknown as PluginID)?.declareWeb3Networks ?? EMPTY_LIST) as Array<
        Web3Helper.NetworkDescriptorScope<S, T>
    >
}
