import { getPluginDefine } from '@masknet/plugin-infra'
import type { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useMemo } from 'react'
import { useChainContext, useNetworkContext } from './useContext.js'

export function useProviderDescriptor<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    expectedPluginID?: T,
    expectedProviderTypeOrID?: string,
): Web3Helper.ProviderDescriptorScope<S, T> {
    const { pluginID } = useNetworkContext(expectedPluginID)
    const { providerType } = useChainContext()
    const typeOrId = expectedProviderTypeOrID ?? providerType ?? ''
    return useMemo(() => {
        return getPluginDefine(pluginID)?.declareWeb3Providers?.find((x) =>
            [x.type, x.ID].includes(typeOrId),
        ) as Web3Helper.ProviderDescriptorScope<S, T>
    }, [pluginID, typeOrId])
}
