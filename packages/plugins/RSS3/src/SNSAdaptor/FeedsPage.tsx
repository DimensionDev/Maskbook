import { EMPTY_LIST } from '@masknet/shared-base'
import { useReverseAddress, useWeb3State } from '@masknet/web3-hooks-base'
import { RSS3, RSS3BaseAPI } from '@masknet/web3-providers'
import { Box, BoxProps } from '@mui/material'
import { memo, useMemo } from 'react'
import { useAsyncRetry } from 'react-use'
import { useI18N } from '../locales/index.js'
import { FeedCard, StatusBox } from './components/index.js'
import { FeedDetailsProvider } from './contexts/FeedDetails.js'
import { FeedOwnerContext, FeedOwnerOptions } from './contexts/index.js'

export interface FeedPageProps extends BoxProps {
    address?: string
    tag?: RSS3BaseAPI.Tag
}

export const FeedsPage = memo(function FeedsPage({ address, tag, ...rest }: FeedPageProps) {
    const t = useI18N()
    const { Others } = useWeb3State()

    const { value: feeds = EMPTY_LIST, loading } = useAsyncRetry(async () => {
        if (!address) return EMPTY_LIST
        const { data } = await RSS3.getAllNotes(address, { tag })
        return data
    }, [address, tag])

    const { value: name } = useReverseAddress(undefined, address)

    const feedOwner = useMemo((): FeedOwnerOptions | undefined => {
        if (!address) return
        const showDomain = !!name && !!Others?.formatDomainName
        const ownerDisplay = showDomain
            ? Others?.formatDomainName(name)
            : Others?.formatAddress?.(address, 4) ?? address
        return {
            address,
            name,
            ownerDisplay,
        }
    }, [address, name, Others?.formatDomainName])

    if (loading || !feeds.length || !feedOwner) {
        return (
            <Box p={2} boxSizing="border-box" {...rest}>
                <StatusBox loading={loading} description={t.no_Activities_found()} empty={!feeds.length} />
            </Box>
        )
    }

    return (
        <FeedOwnerContext.Provider value={feedOwner}>
            <FeedDetailsProvider>
                <Box p={2} boxSizing="border-box" {...rest}>
                    {feeds.map((feed, index) => (
                        <Box key={index} mt={2}>
                            <FeedCard feed={feed} inspectable />
                        </Box>
                    ))}
                </Box>
            </FeedDetailsProvider>
        </FeedOwnerContext.Provider>
    )
})
