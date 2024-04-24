import { NFTBadgeTimeline } from '@masknet/plugin-avatar'

interface MiniAvatarBorderProps {
    size: number
    screenName: string
    avatarId?: string
}
export function MiniAvatarBorder(props: MiniAvatarBorderProps) {
    const { size, screenName, avatarId } = props

    return <NFTBadgeTimeline userId={screenName} avatarId={avatarId || ''} width={size - 4} height={size - 4} />
}
