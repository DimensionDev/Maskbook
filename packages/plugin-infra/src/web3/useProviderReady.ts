import { useMemo } from 'react'
import type { NetworkPluginID } from '../web3-types'
import { useProviderType } from './useProviderType'
import { useCurrentWeb3NetworkPluginID } from './Context'
import { getPluginDefine } from '../manager/store'

export function useProviderReady<T extends NetworkPluginID>(expectedPluginID?: T, expectedProviderTypeOrID?: string) {
    const pluginID = useCurrentWeb3NetworkPluginID(expectedPluginID)
    const providerType = useProviderType(pluginID)

    return getPluginDefine(pluginID)?.declareWeb3Providers?.find((x) =>
        [x.type, x.ID].includes(expectedProviderTypeOrID ?? providerType ?? ''),
    )
}
