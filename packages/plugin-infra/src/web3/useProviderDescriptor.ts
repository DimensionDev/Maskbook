import type { NetworkPluginID } from '../web3-types'
import { useProviderType } from './useProviderType'
import { useCurrentWeb3NetworkPluginID } from './Context'
import { getPluginDefine } from '../manager/store'

export function useProviderDescriptor(expectedProviderTypeOrID?: string, expectedPluginID?: NetworkPluginID) {
    const pluginID = useCurrentWeb3NetworkPluginID()
    const providerType = useProviderType(expectedPluginID ?? pluginID)

    return getPluginDefine(expectedPluginID ?? pluginID)?.declareWeb3Providers?.find((x) =>
        [x.type, x.ID].includes(expectedProviderTypeOrID ?? providerType ?? ''),
    )
}
