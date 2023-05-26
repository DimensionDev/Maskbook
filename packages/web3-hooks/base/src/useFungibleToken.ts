import { useAsyncRetry } from 'react-use'
import type { NetworkPluginID } from '@masknet/shared-base'
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
    const hub = useWeb3Hub(pluginID, options)
    const chainId = useChainId(pluginID, options?.chainId)

    return useAsyncRetry<Web3Helper.FungibleTokenScope<S, T> | undefined>(async () => {
        if (!hub) return
        return attemptUntil(
            [
                async () => {
                    const token = await hub?.getFungibleToken?.(address ?? '', { chainId })
                    const logoURL = token?.logoURL ?? fallbackToken?.logoURL
                    return { ...token, logoURL } as Web3Helper.FungibleTokenScope<S, T>
                },
            ],
            fallbackToken,
        )
    }, [address, hub, chainId, JSON.stringify(options)])
}
