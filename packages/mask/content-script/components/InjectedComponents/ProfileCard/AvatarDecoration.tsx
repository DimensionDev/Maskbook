import { FireflyTwitter, Twitter } from '@masknet/web3-providers'
import { NFTBadgeTimeline } from '@masknet/plugin-avatar'
import { useQuery } from '@tanstack/react-query'

interface Props {
    className?: string
    size: number
    userId?: string
}
export function AvatarDecoration({ userId, className, size }: Props) {
    const { data: user } = useQuery({
        queryKey: ['twitter', 'profile', userId],
        retry: 0,
        staleTime: 3600_000,
        refetchOnWindowFocus: false,
        queryFn: () => {
            if (!userId) return null
            return FireflyTwitter.getUserInfo(userId)
        },
    })

    if (!userId || !user) return null

    return (
        <NFTBadgeTimeline
            classes={{ root: className }}
            userId={userId}
            avatarId={Twitter.getAvatarId(user.legacy.profile_image_url_https)}
            height={size}
            width={size}
        />
    )
}
