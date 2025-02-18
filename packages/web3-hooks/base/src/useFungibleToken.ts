import { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { getHub } from '@masknet/web3-providers'
import type { HubOptions } from '@masknet/web3-providers/types'
import { attemptUntil } from '@masknet/web3-shared-base'
import { isNativeTokenAddress, isValidAddress } from '@masknet/web3-shared-evm'
import { useQuery } from '@tanstack/react-query'
import { useChainContext, useNetworkContext } from './useContext.js'
import { useNetworks } from './useNetworks.js'

export function useFungibleToken<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    address?: string | null,
    fallbackToken?: Web3Helper.FungibleTokenScope<S, T>,
    options?: HubOptions<T>,
) {
    const { chainId } = useChainContext({ chainId: options?.chainId })
    const { pluginID: contextPluginID } = useNetworkContext(pluginID)
    const networks = useNetworks(contextPluginID)

    return useQuery({
        enabled: !!address && isValidAddress(address),
        queryKey: ['fungible-token', contextPluginID, address, chainId, options],
        queryFn: async () => {
            return attemptUntil(
                [
                    async () => {
                        if (
                            contextPluginID !== NetworkPluginID.PLUGIN_EVM ||
                            !isNativeTokenAddress(address!) ||
                            !chainId
                        )
                            return
                        const network = networks.find((x) => x.chainId === chainId)
                        return network?.nativeCurrency
                    },
                    async () => {
                        if (!contextPluginID) return
                        const Hub = getHub(contextPluginID, options)
                        const token = await Hub.getFungibleToken(address!, { chainId })
                        if (!token) return
                        const logoURL = token.logoURL ?? fallbackToken?.logoURL
                        const symbol =
                            token.symbol === 'UNKNOWN' || !token.symbol ? fallbackToken?.symbol : token.symbol
                        return { ...token, symbol, logoURL } as Web3Helper.FungibleTokenScope<S, T>
                    },
                ],
                undefined,
            )
        },
        select(data) {
            return data || fallbackToken
        },
    })
}
