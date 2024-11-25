import { LoadingBase, makeStyles } from '@masknet/theme'
import { FireflyTwitter } from '@masknet/web3-providers'
import { FireflyRedPacketAPI } from '@masknet/web3-providers/types'
import { Link } from '@mui/material'
import { useQuery } from '@tanstack/react-query'

const useStyles = makeStyles()({
    textLink: {
        color: '#8E96FF',
    },
})

function resolveProfileUrl(platform: FireflyRedPacketAPI.PlatformType, handle: string) {
    switch (platform) {
        case FireflyRedPacketAPI.PlatformType.farcaster:
            return `/profile/farcaster/${handle}`
        case FireflyRedPacketAPI.PlatformType.lens:
            return `/profile/lens/${handle}`
        case FireflyRedPacketAPI.PlatformType.twitter:
            return `/${handle}`
    }
}

interface MentionLinkProps {
    platform: FireflyRedPacketAPI.PlatformType
    profileId: string
    handle?: string
}

export function MentionLink({ platform, profileId, handle }: MentionLinkProps) {
    const { classes } = useStyles()
    const isTwitter = platform === FireflyRedPacketAPI.PlatformType.twitter
    const { data: twitterHandle, isLoading } = useQuery({
        enabled: isTwitter && !handle,
        queryKey: ['twitter-user-info', profileId],
        queryFn: async () => {
            return FireflyTwitter.getUserInfoById(profileId)
        },
        select(data) {
            return data?.username
        },
    })

    if (isLoading) return <LoadingBase size={12} />

    if (!handle) return <span>the creator</span>

    return (
        <Link
            href={resolveProfileUrl(
                platform,
                platform === FireflyRedPacketAPI.PlatformType.farcaster ? profileId : handle,
            )}
            target="_blank"
            className={classes.textLink}>
            @{isTwitter ? twitterHandle || handle : handle}
        </Link>
    )
}
