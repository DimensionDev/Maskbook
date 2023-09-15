import type { NetworkPluginID } from '@masknet/shared-base'
import { getPluginDefine } from '@masknet/plugin-infra'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useChainContext, useNetworkContext } from './useContext.js'

export function useChainDescriptor<T extends NetworkPluginID>(
    expectedPluginID?: T,
    expectedChainId?: Web3Helper.Definition[T]['ChainId'],
) {
    const { pluginID } = useNetworkContext(expectedPluginID)
    const { chainId } = useChainContext()

    return getPluginDefine(pluginID)?.contribution?.web3?.chains?.find(
        (x) => x.chainId === (expectedChainId ?? chainId),
    )
}
