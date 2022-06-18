import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { useCurrentWeb3NetworkPluginID } from './Context'
import { getPluginDefine } from '../manager/store'
import { useChainId } from './useChainId'
import type { Web3Helper } from '../web3-helpers'

export function useChainDescriptor<T extends NetworkPluginID>(
    expectedPluginID?: T,
    expectedChainId?: Web3Helper.Definition[T]['ChainId'],
) {
    const pluginID = useCurrentWeb3NetworkPluginID(expectedPluginID)
    const chainId = useChainId(pluginID)

    return getPluginDefine(pluginID)?.declareWeb3Chains?.find((x) => x.chainId === (expectedChainId ?? chainId))
}
