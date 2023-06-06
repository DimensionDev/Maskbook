import { useAsyncRetry } from 'react-use'
import type { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { attemptUntil } from '@masknet/web3-shared-base'
import type { HubOptions } from '@masknet/web3-providers/types'
import { useWeb3Hub } from './useWeb3Hub.js'
import { useChainId } from './useChainId.js'

export function useFungibleToken<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    address?: string,
    fallbackToken?: Web3Helper.FungibleTokenScope<S, T>,
    options?: HubOptions<T>,
) {
    const chainId = useChainId(pluginID, options?.chainId)
    const Hub = useWeb3Hub(pluginID, {
        chainId,
        ...options,
    })

    return useAsyncRetry<Web3Helper.FungibleTokenScope<S, T> | undefined>(async () => {
        if (!address) return
        return attemptUntil(
            [
                async () => {
                    const token = await Hub.getFungibleToken(address ?? '', { chainId })
                    if (!token) return
                    const logoURL = token.logoURL ?? fallbackToken?.logoURL
                    const symbol = token.symbol === 'UNKNOWN' || !token.symbol ? fallbackToken?.symbol : token.symbol
                    return { ...token, symbol, logoURL } as Web3Helper.FungibleTokenScope<S, T>
                },
            ],
            fallbackToken,
        )
    }, [address, chainId, Hub])
}
