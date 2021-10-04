import { makeStyles } from '@masknet/theme'
import { useNFTAvatar } from '../hooks'
import { NFTBadge } from './NFTBadge'

const useStyles = makeStyles()((theme) => ({
    root: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 22,
        zIndex: 1,
        transform: 'scale(0.65)',
    },
}))
interface NFTBadgeTimeLineProps {
    userId: string
    avatarId: string
}

export function NFTBadgeTimeLine(props: NFTBadgeTimeLineProps) {
    const { userId, avatarId } = props
    const { classes } = useStyles()
    const avatar = useNFTAvatar(userId)

    if (!avatar) return null
    if (avatar.avatarId !== avatarId) return null

    return (
        <div className={classes.root}>
            <NFTBadge avatar={avatar} />
        </div>
    )
}
