import { useAsyncRetry } from 'react-use'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { NetworkPluginID } from '@masknet/shared-base'
import { useChainContext } from './useContext.js'
import { useWeb3State } from './useWeb3State.js'

export function useReverseAddress<T extends NetworkPluginID>(
    pluginID?: T,
    address?: string,
    expectedChainId?: Web3Helper.Definition[T]['ChainId'],
) {
    const { chainId } = useChainContext({
        chainId: expectedChainId,
    })
    const { NameService, Others } = useWeb3State(pluginID)

    const isBad = !address || !Others?.isValidAddress?.(address) || Others.isZeroAddress?.(address) || !NameService

    return useAsyncRetry(async () => {
        if (isBad) return
        return NameService.reverse?.(chainId, address)
    }, [address, chainId, isBad])
}
