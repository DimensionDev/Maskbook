import type { NetworkPluginID } from '@masknet/shared-base'
import { getPluginDefine } from '@masknet/plugin-infra'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useNetworkContext } from './useContext.js'
import { useChainId } from './useChainId.js'

export function useChainDescriptor<T extends NetworkPluginID>(
    expectedPluginID?: T,
    expectedChainId?: Web3Helper.Definition[T]['ChainId'],
) {
    const { pluginID } = useNetworkContext(expectedPluginID)
    const chainId = useChainId(pluginID)

    return getPluginDefine(pluginID)?.declareWeb3Chains?.find((x) => x.chainId === (expectedChainId ?? chainId))
}
