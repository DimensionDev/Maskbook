import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { useCurrentWeb3NetworkPluginID } from './Context'
import { getPluginDefine } from '../manager/store'
import { useChainId } from './useChainId'

export function useChainDescriptor<T extends NetworkPluginID, ChainId>(
    expectedPluginID?: T,
    expectedChainId?: ChainId,
) {
    const pluginID = useCurrentWeb3NetworkPluginID(expectedPluginID)
    const chainId = useChainId(pluginID)

    return getPluginDefine(pluginID)?.declareWeb3Chains?.find((x) => x.chainId === (expectedChainId ?? chainId))
}
