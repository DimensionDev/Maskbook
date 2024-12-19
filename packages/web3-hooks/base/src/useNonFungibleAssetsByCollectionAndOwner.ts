import { type NetworkPluginID, type PageIndicator } from '@masknet/shared-base'
import type { HubOptions } from '@masknet/web3-providers/types'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useWeb3Hub } from './useWeb3Hub.js'

export function useNonFungibleAssetsByCollectionAndOwner<T extends NetworkPluginID = NetworkPluginID>(
    collectionId?: string,
    owner?: string,
    pluginID?: T,
    options?: HubOptions<T>,
) {
    const Hub = useWeb3Hub(pluginID, options)

    return useInfiniteQuery({
        enabled: !!collectionId && !!owner,
        queryKey: ['non-fungible-asset', pluginID, collectionId, owner, options],
        initialPageParam: undefined as PageIndicator | undefined,
        queryFn: async ({ pageParam }) => {
            return Hub.getNonFungibleAssetsByCollectionAndOwner(collectionId ?? '', owner ?? '', {
                indicator: pageParam,
                size: 50,
            })
        },
        getNextPageParam: (page) => page.nextIndicator as PageIndicator | undefined,
        select(data) {
            const assets = data.pages.flatMap((x) => x.data)
            if (options?.chainId) {
                return assets.filter((x) => x.chainId === options.chainId)
            }
            return assets
        },
    })
}
