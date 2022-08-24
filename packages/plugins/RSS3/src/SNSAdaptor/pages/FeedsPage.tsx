import { CollectionDetailCard } from '@masknet/shared'
import { EMPTY_LIST } from '@masknet/shared-base'
import { CollectionType, RSS3, RSS3BaseAPI } from '@masknet/web3-providers'
import { Box } from '@mui/material'
import { memo, useState } from 'react'
import { useAsyncRetry } from 'react-use'
import { useI18N } from '../../locales'
import { FeedCard } from '../components/FeedCard'
import { StatusBox } from '../components/StatusBox'

export interface FeedPageProps {
    address?: string
}

export const FeedsPage = memo(function FeedsPage({ address }: FeedPageProps) {
    const t = useI18N()
    const [selectedFeed, setSelectedFeed] = useState<RSS3BaseAPI.Web3Feed>()
    const { value: feeds = EMPTY_LIST, loading } = useAsyncRetry(async () => {
        if (!address) return
        const result = await RSS3.getWeb3Feed(address)
        return result?.list
    }, [address])

    if (loading || !feeds.length) {
        return (
            <Box p={2} boxSizing="border-box">
                <StatusBox loading={loading} description={t.no_Activities_found()} empty={!feeds.length} />
            </Box>
        )
    }

    return (
        <Box p={2} boxSizing="border-box">
            {feeds.map((feed) => {
                return <FeedCard key={feed.links} onSelect={setSelectedFeed} feed={feed} address={address} />
            })}
            {selectedFeed ? (
                <CollectionDetailCard
                    open
                    onClose={() => setSelectedFeed(undefined)}
                    img={selectedFeed.imageURL}
                    title={selectedFeed.title}
                    relatedURLs={selectedFeed.related_urls}
                    description={selectedFeed.summary}
                    metadata={selectedFeed.metadata}
                    traits={selectedFeed.traits}
                    type={CollectionType.Feeds}
                />
            ) : null}
        </Box>
    )
})
