import { useAsyncRetry } from 'react-use'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useWeb3Hub } from './useWeb3Hub.js'
import { attemptUntil } from '@masknet/web3-shared-base'
import { useChainId } from './useChainId.js'

export function useFungibleToken<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    address?: string,
    fallbackToken?: Web3Helper.FungibleTokenScope<S, T>,
    options?: Web3Helper.Web3HubOptionsScope<S, T>,
) {
    const hub = useWeb3Hub()
    const chainId = useChainId(pluginID, options?.chainId)

    return useAsyncRetry<Web3Helper.FungibleTokenScope<S, T> | undefined>(async () => {
        if (!hub) return
        return attemptUntil([() => hub?.getFungibleToken?.(address ?? '', { chainId })], fallbackToken)
    }, [address, hub, chainId, JSON.stringify(options)])
}
