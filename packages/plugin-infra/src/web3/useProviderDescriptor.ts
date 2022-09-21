import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { useProviderType } from './useProviderType.js'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useCurrentWeb3NetworkPluginID } from './Context.js'
import { getPluginDefine } from '../manager/store.js'

export function useProviderDescriptor<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    expectedPluginID?: T,
    expectedProviderTypeOrID?: string,
) {
    const pluginID = useCurrentWeb3NetworkPluginID(expectedPluginID)
    const providerType = useProviderType(pluginID)

    return getPluginDefine(pluginID)?.declareWeb3Providers?.find((x) =>
        [x.type, x.ID].includes(expectedProviderTypeOrID ?? providerType ?? ''),
    ) as Web3Helper.ProviderDescriptorScope<S, T> | undefined
}
