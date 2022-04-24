import type { NetworkPluginID } from '../web3-types'
import { useNetworkType } from './useNetworkType'
import { useCurrentWeb3NetworkPluginID } from './Context'
import { getPluginDefine } from '../manager/store'

export function useNetworkDescriptor(
    expectedChainIdOrNetworkTypeOrID?: number | string,
    expectedPluginID?: NetworkPluginID,
) {
    const pluginID = useCurrentWeb3NetworkPluginID()
    const pid = expectedPluginID ?? pluginID
    const networkType = useNetworkType(pid)

    return getPluginDefine(pid)?.declareWeb3Networks?.find((x) =>
        [x.chainId, x.type, x.ID].includes(expectedChainIdOrNetworkTypeOrID ?? networkType ?? ''),
    )
}
