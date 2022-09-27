import { memo, useState } from 'react'
import { useAsyncRetry } from 'react-use'
import { CollectionDetailCard } from '@masknet/shared'
import { EMPTY_LIST } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { CollectionType, RSS3 } from '@masknet/web3-providers'
import { Box, BoxProps } from '@mui/material'
import { useI18N } from '../../locales/index.js'
import type { RSS3Feed } from '../../types.js'
import { FeedCard } from '../components/FeedCard.js'
import { StatusBox } from '../components/StatusBox.js'

export interface FeedPageProps extends BoxProps {
    address?: string
    // Allow to click to view activity details
    disableViewDetails?: boolean
}

const useStyles = makeStyles()(() => ({
    normalCard: {
        cursor: 'default',
    },
}))

export const FeedsPage = memo(function FeedsPage({ address, disableViewDetails, ...rest }: FeedPageProps) {
    const { classes } = useStyles()
    const t = useI18N()
    const [selectedFeed, setSelectedFeed] = useState<RSS3Feed>()
    const { value: feeds = EMPTY_LIST, loading } = useAsyncRetry(async () => {
        if (!address) return EMPTY_LIST
        const { data } = await RSS3.getWeb3Feeds(address)
        return data
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
            {feeds.map((feed, index) => {
                return (
                    <FeedCard
                        key={index}
                        className={disableViewDetails ? classes.normalCard : undefined}
                        onSelect={setSelectedFeed}
                        feed={feed}
                        address={address}
                    />
                )
            })}
            {selectedFeed && !disableViewDetails ? (
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
