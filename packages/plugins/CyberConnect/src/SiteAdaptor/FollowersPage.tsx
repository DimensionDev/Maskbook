import { ThemeProvider } from '@emotion/react'
import { ElementAnchor, LoadingStatus, ReloadStatus } from '@masknet/shared'
import { LoadingBase, MaskLightTheme } from '@masknet/theme'
import { Box } from '@mui/material'
import type { IFollowIdentity } from '../Worker/apis/index.js'
import type { ProfileTab } from '../constants.js'
import { useFollowers } from '../hooks/useFollowers.js'
import { FollowRow } from './FollowTab.js'
import { Trans } from '@lingui/macro'

interface FollowersPageProps {
    address?: string
    hint?: React.ReactNode
    tab: ProfileTab
}

export function FollowersPage(props: FollowersPageProps) {
    const { data, fetchNextPage, hasNextPage, isPending, refetch, error } = useFollowers(props.tab, props.address)
    const followers = data?.pages.flatMap((x) => x?.data || []) || []

    if (error) {
        return (
            <ThemeProvider theme={MaskLightTheme}>
                <ReloadStatus height={400} p={2} message={<Trans>Load failed</Trans>} onRetry={refetch} />
            </ThemeProvider>
        )
    }

    if (!followers.length && isPending) return <LoadingStatus height={400} omitText />

    return (
        <Box>
            {followers.map((x: IFollowIdentity) => (
                <FollowRow key={x.ens || x.address} identity={x} />
            ))}
            <ElementAnchor callback={() => fetchNextPage()}>
                {hasNextPage && isPending ?
                    <LoadingBase />
                :   null}
            </ElementAnchor>
        </Box>
    )
}
