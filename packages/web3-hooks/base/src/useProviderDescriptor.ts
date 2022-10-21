import type { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { getPluginDefine } from '@masknet/plugin-infra'
import { useProviderType } from './useProviderType.js'
import { useNetworkContext } from './useContext.js'

export function useProviderDescriptor<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    expectedPluginID?: T,
    expectedProviderTypeOrID?: string,
) {
    const { pluginID } = useNetworkContext(expectedPluginID)
    const providerType = useProviderType(pluginID)

    return getPluginDefine(pluginID)?.declareWeb3Providers?.find((x) =>
        [x.type, x.ID].includes(expectedProviderTypeOrID ?? providerType ?? ''),
    ) as Web3Helper.ProviderDescriptorScope<S, T> | undefined
}
