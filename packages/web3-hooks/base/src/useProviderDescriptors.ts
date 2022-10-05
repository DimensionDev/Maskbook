import { EMPTY_LIST } from '@masknet/shared-base'

import { NetworkPluginID } from '@masknet/shared-base'
import { getPluginDefine } from '@masknet/plugin-infra'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useCurrentWeb3NetworkPluginID } from './useContext.js'

export function useProviderDescriptors<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    expectedPluginID?: T,
) {
    const pluginID = useCurrentWeb3NetworkPluginID(expectedPluginID)
    return (getPluginDefine(pluginID)?.declareWeb3Providers ?? EMPTY_LIST) as Array<
        Web3Helper.ProviderDescriptorScope<S, T>
    >
}
