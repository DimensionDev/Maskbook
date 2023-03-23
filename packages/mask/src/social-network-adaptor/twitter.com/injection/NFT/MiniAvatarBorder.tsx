import { NFTAvatarMiniClip, NFTBadgeTimeline, RSS3_KEY_SNS, NFTAvatarMiniSquare } from '@masknet/plugin-avatar'
import { MaskMessages } from '../../../../utils/messages.js'
import { AvatarType } from '../../constant.js'
import { makeStyles } from '@masknet/theme'

const useStyles = makeStyles()((theme) => ({
    square: {
        transform: 'translate(-1px, -1px) scale(0.95)',
    },
}))

interface MiniAvatarBorderProps {
    avatarType: AvatarType
    size: number
    screenName: string
    avatarId?: string
}
export function MiniAvatarBorder(props: MiniAvatarBorderProps) {
    const { avatarType, size, screenName, avatarId } = props
    const { classes } = useStyles()

    if (avatarType === AvatarType.Clip) return <NFTAvatarMiniClip screenName={screenName} size={size} />
    if (avatarType === AvatarType.Circle)
        return (
            <NFTBadgeTimeline
                timelineUpdated={MaskMessages.events.NFTAvatarTimelineUpdated}
                userId={screenName}
                avatarId={avatarId || ''}
                width={size - 4}
                height={size - 4}
                snsKey={RSS3_KEY_SNS.TWITTER}
            />
        )
    if (avatarType === AvatarType.Square)
        return <NFTAvatarMiniSquare classes={{ root: classes.square }} screenName={screenName} size={size} />
    return null
}
