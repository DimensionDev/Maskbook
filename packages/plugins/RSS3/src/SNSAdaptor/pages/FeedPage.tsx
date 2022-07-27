import { CollectionDetailCard } from '@masknet/shared'
import { RSS3, RSS3BaseAPI } from '@masknet/web3-providers'
import type { NetworkPluginID, SocialAddress } from '@masknet/web3-shared-base'
import { useState } from 'react'
import { useAsyncRetry } from 'react-use'
import { FeedCard } from '../components/FeedCard'
import { StatusBox } from '../components/StatusBox'
import { useI18N } from '../../locales'

export interface FeedPageProps {
    socialAddress?: SocialAddress<NetworkPluginID>
}

export function FeedPage({ socialAddress }: FeedPageProps) {
    const t = useI18N()
    const [selectedFeed, setSelectedFeed] = useState<RSS3BaseAPI.Web3Feed>()
    const { value: feed, loading } = useAsyncRetry(async () => {
        if (!socialAddress?.address) return
        return RSS3.getWeb3Feed(socialAddress?.address)
    }, [socialAddress])

    if (!socialAddress) return null
    if (loading || !feed?.list?.length) {
        return <StatusBox loading={loading} collection={t.feed()} empty={!feed?.list?.length} />
    }

    return (
        <div style={{ margin: '16px 16px 0 16px' }}>
            {feed?.list?.map((info) => {
                return (
                    <FeedCard
                        key={info.links}
                        onSelect={(feed) => setSelectedFeed(feed)}
                        feed={info}
                        address={socialAddress?.address}
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
            />
        </div>
    )
}
