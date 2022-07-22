import { CollectionDetailCard } from '@masknet/shared'
import { RSS3, RSS3BaseAPI } from '@masknet/web3-providers'
import type { NetworkPluginID, SocialAddress } from '@masknet/web3-shared-base'
import { useState } from 'react'
import { useAsyncRetry } from 'react-use'
import { FeedCard } from './FeedCard'
import { StatusBox } from './StatusBox'

export interface Web3FeedPageProps {
    persona?: string
    socialAddress?: SocialAddress<NetworkPluginID>
}

export function Web3FeedPage({ socialAddress, persona }: Web3FeedPageProps) {
    const [selectedFeed, setSelectedFeed] = useState<RSS3BaseAPI.Web3Feed>()
    const { value: feed, loading } = useAsyncRetry(async () => {
        if (!socialAddress?.address) return
        return RSS3.getWeb3Feed(socialAddress?.address)
    }, [socialAddress])

    if (!socialAddress) return null
    if (loading || !feed?.list?.length) {
        return <StatusBox loading={loading} empty={!feed?.list?.length} />
    }

    return (
        <div style={{ marginTop: '16px' }}>
            {feed?.list?.map((info, index) => {
                return (
                    <FeedCard
                        key={info.links}
                        index={index}
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
