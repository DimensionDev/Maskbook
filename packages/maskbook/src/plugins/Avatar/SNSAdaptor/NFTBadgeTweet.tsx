import { makeStyles } from '@masknet/theme'
import { useCurrentIdentity } from '../../../components/DataSource/useActivatedUI'
import { getAvatarId } from '../../../social-network-adaptor/twitter.com/utils/user'
import { NFTBadgeTimeline } from './NFTBadgeTimeline'

const useStyles = makeStyles()((theme) => ({
    root: {
        position: 'absolute',
        top: 4,
        left: 0,
    },
}))

interface NFTBadgeTweetProps {
    width: number
    height: number
}

export function NFTBadgeTweet(props: NFTBadgeTweetProps) {
    const { width, height } = props
    const identity = useCurrentIdentity()

    if (!identity?.identifier.userId) return null
    return (
        <NFTBadgeTimeline
            width={width}
            height={height}
            userId={identity?.identifier.userId}
            avatarId={getAvatarId(identity?.avatar ?? '')}
        />
    )
}
