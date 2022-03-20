import type { NetworkPluginID } from '..'
import { useProviderType } from './useProviderType'
import { usePluginIDContext } from './Context'
import { getPluginDefine } from '../manager/store'

export function useProviderDescriptor(expectedPluginID?: NetworkPluginID, expectedProviderTypeOrID?: string) {
    const pluginID = usePluginIDContext(expectedPluginID)
    const providerType = useProviderType(pluginID)

    return getPluginDefine(pluginID)?.declareWeb3Providers?.find((x) =>
        [x.type, x.ID].includes(expectedProviderTypeOrID ?? providerType ?? ''),
    )
}
