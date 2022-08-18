import { CollectionDetailCard } from '@masknet/shared'
import { CollectionType, RSS3, RSS3BaseAPI } from '@masknet/web3-providers'
import { memo, useState } from 'react'
import { useAsyncRetry } from 'react-use'
import { useI18N } from '../../locales'
import { FeedCard } from '../components/FeedCard'
import { StatusBox } from '../components/StatusBox'

export interface FeedPageProps {
    address: string
}

export const FeedsPage = memo(function FeedsPage({ address }: FeedPageProps) {
    const t = useI18N()
    const [selectedFeed, setSelectedFeed] = useState<RSS3BaseAPI.Web3Feed>()
    const { value: feed, loading } = useAsyncRetry(async () => {
        return RSS3.getWeb3Feed(address)
    }, [address])

    if (loading || !feed?.list?.length) {
        return <StatusBox loading={loading} description={t.no_Activities_found()} empty={!feed?.list?.length} />
    }

    return (
        <div style={{ margin: '16px 16px 0 16px' }}>
            {feed.list.map((info) => {
                return (
                    <FeedCard
                        key={info.links}
                        onSelect={(feed) => setSelectedFeed(feed)}
                        feed={info}
                        address={address}
                    />
                )
            })}
            <CollectionDetailCard
                open={Boolean(selectedFeed)}
                onClose={() => setSelectedFeed(undefined)}
                img={selectedFeed?.imageURL}
                title={selectedFeed?.title}
                relatedURLs={selectedFeed?.related_urls}
                description={selectedFeed?.summary}
                metadata={selectedFeed?.metadata}
                traits={selectedFeed?.traits}
                type={CollectionType.Feeds}
            />
        </div>
    )
})
