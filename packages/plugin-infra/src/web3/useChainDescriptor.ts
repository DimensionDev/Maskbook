import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { useCurrentWeb3NetworkPluginID } from './Context.js'
import { getPluginDefine } from '../manager/store.js'
import { useChainId } from './useChainId.js'
import type { Web3Helper } from '../web3-helpers/index.js'

export function useChainDescriptor<T extends NetworkPluginID>(
    expectedPluginID?: T,
    expectedChainId?: Web3Helper.Definition[T]['ChainId'],
) {
    const pluginID = useCurrentWeb3NetworkPluginID(expectedPluginID)
    const chainId = useChainId(pluginID)

    return getPluginDefine(pluginID)?.declareWeb3Chains?.find((x) => x.chainId === (expectedChainId ?? chainId))
}
