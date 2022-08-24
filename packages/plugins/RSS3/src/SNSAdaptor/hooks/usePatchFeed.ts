import { useMemo } from 'react'
import { useAsyncRetry } from 'react-use'
import { AlchemyEVM, RSS3BaseAPI } from '@masknet/web3-providers'
import { ChainId, resolveIPFSLinkFromURL } from '@masknet/web3-shared-evm'

export const ChainID = {
    ethereum: ChainId.Mainnet,
    polygon: ChainId.Matic,
    bnb: ChainId.BSC,
}

/**
 *
 * Patch with some metadata fetched from data provider e.g Alchemy.
 */
export function usePatchFeed(feed: RSS3BaseAPI.Web3Feed) {
    const { value: asset } = useAsyncRetry(async () => {
        if ((feed.title && feed.summary) || !feed.metadata?.collection_address) return

        const asset = await AlchemyEVM.getAsset(feed.metadata.collection_address, feed.metadata?.token_id ?? '', {
            chainId: ChainID[feed.metadata?.network ?? 'ethereum'],
        })
        return asset
    }, [feed.metadata?.collection_address])

    const patched = useMemo(() => {
        if (!asset) return feed
        const title =
            feed.title ||
            asset.metadata?.name ||
            asset.collection?.name ||
            asset.contract?.name ||
            `#${feed.metadata?.token_id}`

        const summary = feed.summary || asset.metadata?.description || asset.collection?.description
        const imageURL = resolveIPFSLinkFromURL(
            asset.metadata?.imageURL ||
                feed.attachments?.find((attachment) => attachment?.type === 'preview')?.address ||
                feed.attachments?.find((attachment) => attachment?.type === 'logo')?.address ||
                '',
        )
        const traits = asset?.traits
        return {
            ...feed,
            title,
            summary,
            imageURL,
            traits,
        }
    }, [feed])

    return patched
}
