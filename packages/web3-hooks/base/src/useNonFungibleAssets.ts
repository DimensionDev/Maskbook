import { useMemo } from 'react'
import type { Web3Helper } from '@masknet/web3-helpers'
import { pageableToIterator, flattenAsyncIterator, type NetworkPluginID, EMPTY_LIST } from '@masknet/shared-base'
import { useChainContext } from './useContext.js'
import { useNetworkDescriptors } from './useNetworkDescriptors.js'
import { useWeb3State } from './useWeb3State.js'
import { useIterator } from './useIterator.js'

export function useNonFungibleAssets<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    schemaType?: Web3Helper.SchemaTypeScope<S, T>,
    options?: Web3Helper.Web3HubOptionsScope<S, T>,
) {
    const { Hub } = useWeb3State(pluginID)
    const { account, chainId } = useChainContext({ account: options?.account })
    const networks = useNetworkDescriptors(pluginID)

    // create iterator
    const iterator = useMemo(() => {
        const hub = Hub?.getHub?.({ account, chainId, ...options })
        if (!account || !hub?.getNonFungibleAssets) return

        return flattenAsyncIterator(
            networks
                .filter((x) => x.isMainnet && (options?.chainId ? x.chainId === options.chainId : true))
                .map((x) => {
                    return pageableToIterator(async (indicator) => {
                        return hub.getNonFungibleAssets!(account, {
                            indicator,
                            size: 50,
                            ...options,
                            chainId: x.chainId,
                        })
                    })
                }),
        )
    }, [Hub, account, JSON.stringify(options), networks, chainId])
    const { value: assets, next, retry, loading, done, error } = useIterator(iterator)

    const value = useMemo(() => {
        if (!assets?.length) return EMPTY_LIST
        return assets.filter((x) => (options?.chainId ? x.chainId === options.chainId : true))
    }, [assets, options?.chainId])

    return {
        value,
        next,
        loading,
        done,
        retry,
        error,
    }
}
