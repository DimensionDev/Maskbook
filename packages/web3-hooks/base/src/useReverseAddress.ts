import { useAsyncRetry } from 'react-use'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { NetworkPluginID } from '@masknet/shared-base'
import { useChainId } from './useChainId.js'
import { useWeb3State } from './useWeb3State.js'

export function useReverseAddress<T extends NetworkPluginID>(
    address: string,
    pluginID?: T,
    expectedChainId?: Web3Helper.Definition[T]['ChainId'],
) {
    const chainId = useChainId(pluginID, expectedChainId)
    const { NameService, Others } = useWeb3State(pluginID)

    return useAsyncRetry(async () => {
        if (!chainId || !address || !Others?.isValidAddress?.(address) || !NameService) return
        return NameService.reverse?.(address)
    }, [address, NameService])
}
