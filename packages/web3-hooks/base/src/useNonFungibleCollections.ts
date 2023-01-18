import { mapKeys } from 'lodash-es'
import { useAsyncRetry } from 'react-use'
import { fetchJSON } from '@masknet/web3-providers/helpers'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { asyncIteratorToArray, NetworkPluginID } from '@masknet/shared-base'
import { HubIndicator, NonFungibleCollection, pageableToIterator, attemptUntil } from '@masknet/web3-shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useChainContext } from './useContext.js'
import { useWeb3Hub } from './useWeb3Hub.js'

const NFT_LUCKY_DROP_DSEARCH_URL = 'https://dsearch.mask.r2d2.to/nft-lucky-drop/specific-list.json'

export function useNonFungibleCollections<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    options?: Web3Helper.Web3HubOptionsScope<S, T>,
) {
    const { account, chainId } = useChainContext({ account: options?.account, chainId: options?.chainId })
    const hub = useWeb3Hub(pluginID, options)

    return useAsyncRetry<
        Array<NonFungibleCollection<Web3Helper.ChainIdScope<S, T>, Web3Helper.SchemaTypeScope<S, T>>>
    >(async () => {
        if (!account || !hub) return []

        const iterator = pageableToIterator(async (indicator?: HubIndicator) => {
            if (!hub.getNonFungibleCollectionsByOwner) return
            return hub.getNonFungibleCollectionsByOwner(account, {
                indicator,
                size: 50,
                ...options,
            })
        })

        return attemptUntil(
            [
                async () => asyncIteratorToArray(iterator),
                async () => {
                    const result = await fetchJSON<{
                        [owner: string]: Array<NonFungibleCollection<ChainId, SchemaType.ERC721>>
                    }>(NFT_LUCKY_DROP_DSEARCH_URL)
                    return (
                        mapKeys(result, (_v, k) => k.toLowerCase())?.[account.toLowerCase()].filter(
                            (x) => x.chainId === chainId,
                        ) ?? []
                    )
                },
            ],
            [],
        )
    }, [account, hub, chainId, JSON.stringify(options)])
}
