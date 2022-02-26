import type { NetworkPluginID } from '../web3-types'
import { useNetworkType } from './useNetworkType'
import { useCurrentWeb3NetworkPluginID } from './Context'
import { getPluginDefine } from '../manager/store'

export function useNetworkDescriptor(
    expectedPluginID?: NetworkPluginID,
    expectedChainIdOrNetworkTypeOrID?: number | string,
) {
    const pluginID = useCurrentWeb3NetworkPluginID(expectedPluginID)
    const networkType = useNetworkType(pluginID)

    return getPluginDefine(pluginID)?.declareWeb3Networks?.find((x) =>
        [x.chainId, x.type, x.ID].includes(expectedChainIdOrNetworkTypeOrID ?? networkType ?? ''),
    )
}
