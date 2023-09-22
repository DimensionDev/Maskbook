import { useAsync } from 'react-use'
import { Twitter } from '@masknet/web3-providers'
import { RSS3_KEY_SITE, NFTAvatarMiniClip, NFTBadgeTimeline } from '@masknet/plugin-avatar'

interface Props {
    className?: string
    clipPathId: string
    size: number
    userId?: string
}
export function AvatarDecoration({ clipPathId, userId, className, size }: Props) {
    const { value: user } = useAsync(async () => {
        if (!userId) return null
        return Twitter.getUserByScreenName(userId, true)
    }, [userId])

    if (!userId || !user) return null

    return user.has_nft_avatar ? (
        <NFTAvatarMiniClip className={className} id={clipPathId} size={size} screenName={userId} />
    ) : (
        <NFTBadgeTimeline
            classes={{ root: className }}
            userId={userId}
            avatarId={Twitter.getAvatarId(user.avatarURL)}
            height={size}
            width={size}
            siteKey={RSS3_KEY_SITE.TWITTER}
        />
    )
}
