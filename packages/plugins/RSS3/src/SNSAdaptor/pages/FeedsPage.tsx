import { CollectionDetailCard } from '@masknet/shared'
import { EMPTY_LIST } from '@masknet/shared-base'
import { CollectionType, RSS3 } from '@masknet/web3-providers'
import { Box, BoxProps } from '@mui/material'
import { memo, useState } from 'react'
import { useAsyncRetry } from 'react-use'
import { useI18N } from '../../locales'
import type { RSS3Feed } from '../../types'
import { FeedCard } from '../components/FeedCard'
import { StatusBox } from '../components/StatusBox'

export interface FeedPageProps extends BoxProps {
    address?: string
}

export const FeedsPage = memo(function FeedsPage({ address, ...rest }: FeedPageProps) {
    const t = useI18N()
    const [selectedFeed, setSelectedFeed] = useState<RSS3Feed>()
    const { value: feeds = EMPTY_LIST, loading } = useAsyncRetry(async () => {
        if (!address) return EMPTY_LIST
        return RSS3.getWeb3Feeds(address)
    }, [address])

    if (loading || !feeds.length) {
        return (
            <Box p={2} boxSizing="border-box" {...rest}>
                <StatusBox loading={loading} description={t.no_Activities_found()} empty={!feeds.length} />
            </Box>
        )
    }

    return (
        <Box p={2} boxSizing="border-box" {...rest}>
            {feeds.map((feed) => {
                return <FeedCard key={feed.timestamp} onSelect={setSelectedFeed} feed={feed} address={address} />
            })}
            {selectedFeed ? (
                <CollectionDetailCard
                    open
                    onClose={() => setSelectedFeed(undefined)}
                    img={selectedFeed.image}
                    title={selectedFeed.title}
                    relatedURLs={selectedFeed.relatedURLs}
                    description={selectedFeed.description}
                    network={selectedFeed.network}
                    metadata={selectedFeed.metadata}
                    attributes={selectedFeed.attributes}
                    type={CollectionType.Feeds}
                />
            ) : null}
        </Box>
    )
})
