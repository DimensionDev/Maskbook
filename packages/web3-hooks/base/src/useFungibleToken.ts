import type { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { HubOptions } from '@masknet/web3-providers/types'
import { attemptUntil } from '@masknet/web3-shared-base'
import { useQuery } from '@tanstack/react-query'
import { useChainId } from './useChainId.js'
import { useWeb3Hub } from './useWeb3Hub.js'

export function useFungibleToken<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    address?: string | null,
    fallbackToken?: Web3Helper.FungibleTokenScope<S, T>,
    options?: HubOptions<T>,
) {
    const chainId = useChainId(pluginID, options?.chainId)
    const Hub = useWeb3Hub(pluginID, {
        chainId,
        ...options,
    })

    return useQuery({
        enabled: !!address,
        queryKey: ['fungible-token', pluginID, address, chainId, options],
        queryFn: async () => {
            if (!address) return
            return attemptUntil(
                [
                    async () => {
                        const token = await Hub.getFungibleToken(address, { chainId })
                        if (!token) return
                        const logoURL = token.logoURL ?? fallbackToken?.logoURL
                        const symbol =
                            token.symbol === 'UNKNOWN' || !token.symbol ? fallbackToken?.symbol : token.symbol
                        return { ...token, symbol, logoURL } as Web3Helper.FungibleTokenScope<S, T>
                    },
                ],
                fallbackToken,
            )
        },
    })
}
