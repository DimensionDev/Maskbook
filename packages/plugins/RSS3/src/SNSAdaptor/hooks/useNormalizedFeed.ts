import { RSS3BaseAPI } from '@masknet/web3-providers'
import { useMemo } from 'react'
import { RSS3_DEFAULT_IMAGE } from '../../constants'
import type { RSS3Feed } from '../../types'

const { Tag } = RSS3BaseAPI
export function useNormalizeFeed(feed: RSS3BaseAPI.Activity): RSS3Feed {
    return useMemo(() => {
        if (feed.tag === Tag.Collectible) {
            const action = feed.actions[0]
            const metadata = action.metadata
            return {
                image: metadata?.image || RSS3_DEFAULT_IMAGE,
                title: metadata?.name,
                relatedURLs: action.related_urls,
                description: metadata?.description ?? '',
                network: feed.network,
                attributes: metadata && 'attributes' in metadata ? metadata.attributes : [],
                metadata: {
                    collection_address: metadata?.contract_address,
                    network: feed.network,
                },
                tokenId: metadata?.id,
            }
        }
        if (feed.tag === Tag.Donation) {
            const action = feed.actions[0]
            const metadata = action.metadata
            return {
                image: metadata?.logo || RSS3_DEFAULT_IMAGE,
                title: metadata?.title,
                relatedURLs: action.related_urls,
                description: metadata?.description,
                network: feed.network,
                attributes: [],
                metadata: undefined,
            }
        } else {
            const action = feed.actions[0]
            const metadata = action.metadata
            return {
                image: metadata?.image || RSS3_DEFAULT_IMAGE,
                title: action.type,
                relatedURLs: action.related_urls,
                description: metadata?.value_display ? `${metadata?.value_display} ${metadata?.symbol}` : '',
                network: feed.network,
                attributes: [],
                metadata: {
                    collection_address: metadata?.contract_address,
                    network: feed.network,
                },
            }
        }
    }, [feed])
}
