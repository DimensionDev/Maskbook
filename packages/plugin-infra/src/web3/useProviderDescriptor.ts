import { useProviderType, usePluginIDContext } from '.'
import { getPluginDefine } from '..'

export function useProviderDescriptor(expectedProviderTypeOrID?: string, expectedPluginID?: string) {
    const pluginID = usePluginIDContext()
    const providerType = useProviderType()

    return getPluginDefine(expectedPluginID ?? pluginID)?.declareWeb3Providers?.find((x) =>
        [x.type, x.ID].includes(expectedProviderTypeOrID ?? providerType ?? ''),
    )
}
