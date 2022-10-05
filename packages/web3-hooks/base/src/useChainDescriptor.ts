import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { getPluginDefine } from '@masknet/plugin-infra'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useCurrentWeb3NetworkPluginID } from './useContext.js'
import { useChainId } from './useChainId.js'

export function useChainDescriptor<T extends NetworkPluginID>(
    expectedPluginID?: T,
    expectedChainId?: Web3Helper.Definition[T]['ChainId'],
) {
    const pluginID = useCurrentWeb3NetworkPluginID(expectedPluginID)
    const chainId = useChainId(pluginID)

    return getPluginDefine(pluginID)?.declareWeb3Chains?.find((x) => x.chainId === (expectedChainId ?? chainId))
}
