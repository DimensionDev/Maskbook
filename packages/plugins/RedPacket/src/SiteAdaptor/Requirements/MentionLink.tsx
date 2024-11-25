import { LoadingBase, makeStyles } from '@masknet/theme'
import { FireflyTwitter } from '@masknet/web3-providers'
import { FireflyRedPacketAPI } from '@masknet/web3-providers/types'
import { Link } from '@mui/material'
import { useQuery } from '@tanstack/react-query'

const useStyles = makeStyles()({
    textLink: {
        display: 'inline-flex',
        alignItems: 'center',
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

interface MentionLinkProps extends FireflyRedPacketAPI.ProfileFollowStrategyPayload {}

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
            return data?.legacy.screen_name
        },
    })
    const screenName = isTwitter ? twitterHandle || handle : handle
    if (isLoading && !screenName) {
        return <LoadingBase size={12} />
    }

    return (
        <Link
            href={resolveProfileUrl(
                platform,
                platform === FireflyRedPacketAPI.PlatformType.farcaster ? profileId : screenName!,
            )}
            target="_blank"
            className={classes.textLink}>
            @{screenName}
        </Link>
    )
}
