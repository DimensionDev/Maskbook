import { AvatarType, NFTAvatarMiniClip, NFTBadgeTimeline, RSS3_KEY_SNS } from '@masknet/plugin-avatar'

interface MiniAvatarBorderProps {
    avatarType: AvatarType
    size: number
    screenName: string
    avatarId?: string
}
export function MiniAvatarBorder(props: MiniAvatarBorderProps) {
    const { avatarType, size, screenName, avatarId } = props

    if (avatarType === AvatarType.Clip) return <NFTAvatarMiniClip screenName={screenName} size={size} />

    return (
        <NFTBadgeTimeline
            userId={screenName}
            avatarId={avatarId || ''}
            width={size - 4}
            height={size - 4}
            snsKey={RSS3_KEY_SNS.TWITTER}
            avatarType={avatarType}
        />
    )
}
