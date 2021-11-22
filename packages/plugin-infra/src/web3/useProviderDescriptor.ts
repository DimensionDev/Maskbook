import type { NetworkPluginID } from '..'
import { useProviderType } from './useProviderType'
import { usePluginIDContext } from './Context'
import { getPluginDefine } from '../manager/store'

export function useProviderDescriptor(expectedProviderTypeOrID?: string, expectedPluginID?: NetworkPluginID) {
    const pluginID = usePluginIDContext()
    const providerType = useProviderType(expectedPluginID ?? pluginID)

    return getPluginDefine(expectedPluginID ?? pluginID)?.declareWeb3Providers?.find((x) =>
        [x.type, x.ID].includes(expectedProviderTypeOrID ?? providerType ?? ''),
    )
}
