import { useMemo } from 'react'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { HubOptions } from '@masknet/web3-providers/types'
import { pageableToIterator, flattenAsyncIterator, type NetworkPluginID, EMPTY_LIST } from '@masknet/shared-base'
import { useChainContext } from './useContext.js'
import { useNetworkDescriptors } from './useNetworkDescriptors.js'
import { useIterator } from './useIterator.js'
import { useWeb3Hub } from './useWeb3Hub.js'

export function useNonFungibleAssets<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    schemaType?: Web3Helper.SchemaTypeScope<S, T>,
    options?: HubOptions<T>,
) {
    const { account, chainId } = useChainContext({ account: options?.account })
    const Hub = useWeb3Hub(pluginID, { account, chainId, ...options })
    const networks = useNetworkDescriptors(pluginID)

    // create iterator
    const iterator = useMemo(() => {
        if (!account) return

        return flattenAsyncIterator(
            networks
                .filter((x) => x.isMainnet && (options?.chainId ? x.chainId === options.chainId : true))
                .map((x) => {
                    return pageableToIterator(async (indicator) => {
                        return Hub.getNonFungibleAssets!(account, {
                            indicator,
                            size: 50,
                            chainId: x.chainId,
                        })
                    })
                }),
        )
    }, [Hub, account, networks, chainId])

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
