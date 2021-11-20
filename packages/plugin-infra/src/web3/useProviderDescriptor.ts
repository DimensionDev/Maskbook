import { useProviderType } from './useProviderType'
import { usePluginIDContext } from './Context'
import { getPluginDefine } from '../manager/store'

export function useProviderDescriptor(expectedProviderTypeOrID?: string, expectedPluginID?: string) {
    const pluginID = usePluginIDContext()
    const providerType = useProviderType()

    return getPluginDefine(expectedPluginID ?? pluginID)?.declareWeb3Providers?.find((x) =>
        [x.type, x.ID].includes(expectedProviderTypeOrID ?? providerType ?? ''),
    )
}
