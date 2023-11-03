import { Twitter } from '@masknet/web3-providers'
import { RSS3_KEY_SITE, NFTAvatarMiniClip, NFTBadgeTimeline } from '@masknet/plugin-avatar'
import { useQuery } from '@tanstack/react-query'

interface Props {
    className?: string
    clipPathId: string
    size: number
    userId?: string
}
export function AvatarDecoration({ clipPathId, userId, className, size }: Props) {
    const { data: user } = useQuery({
        queryKey: ['twitter', 'profile', 'check-nft-avatar', userId],
        queryFn: () => {
            if (!userId) return null
            console.log('DEBUG: Avatar Decoration', userId)
            return Twitter.getUserByScreenName(userId, true)
        },
    })

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
