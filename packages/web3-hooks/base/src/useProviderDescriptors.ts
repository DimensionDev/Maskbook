import { EMPTY_LIST, type NetworkPluginID } from '@masknet/shared-base'
import { getPluginDefine } from '@masknet/plugin-infra'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useNetworkContext } from './useContext.js'

export function useProviderDescriptors<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    expectedPluginID?: T,
) {
    const { pluginID } = useNetworkContext(expectedPluginID)

    return (getPluginDefine(pluginID)?.declareWeb3Providers ?? EMPTY_LIST) as Array<
        Web3Helper.ProviderDescriptorScope<S, T>
    >
}
