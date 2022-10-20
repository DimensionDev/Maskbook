import { memo } from 'react'
import { useAsyncRetry } from 'react-use'
import { EMPTY_LIST } from '@masknet/shared-base'
import { RSS3 } from '@masknet/web3-providers'
import { Box, BoxProps } from '@mui/material'
import { useI18N } from '../../locales/index.js'
import { FeedCard } from '../components/FeedCard.js'
import { StatusBox } from '../components/StatusBox.js'

export interface FeedPageProps extends BoxProps {
    address?: string
}

export const FeedsPage = memo(function FeedsPage({ address, ...rest }: FeedPageProps) {
    const t = useI18N()
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
                return <FeedCard key={index} feed={feed} address={address} />
            })}
        </Box>
    )
})
