import { useAsyncRetry } from 'react-use'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { useChainId } from './useChainId'
import { useWeb3State } from './useWeb3State'
import type { Web3Helper } from '../web3-helpers'

export function useReverseAddress<T extends NetworkPluginID>(pluginID?: T, address?: string) {
    type ReverseAddress = (
        chainId: Web3Helper.Definition[T]['ChainId'],
        address?: string,
    ) => Promise<string | undefined>

    const chainId = useChainId(pluginID)
    const { NameService, Others } = useWeb3State(pluginID)

    return useAsyncRetry(async () => {
        if (!chainId || !Others?.isValidAddress?.(address) || !NameService) return
        return (NameService.reverse as ReverseAddress)(chainId, address)
    }, [address, chainId, NameService])
}
