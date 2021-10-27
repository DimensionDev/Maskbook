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

interface NFTBadgeTweetProps {}

export function NFTBadgeTweet(props: NFTBadgeTweetProps) {
    const { classes } = useStyles()
    const identity = useCurrentIdentity()

    if (!identity?.identifier.userId) return null
    return (
        <div className={classes.root}>
            <NFTBadgeTimeline userId={identity?.identifier.userId} avatarId={getAvatarId(identity?.avatar ?? '')} />
        </div>
    )
}
