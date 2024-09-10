import { Twitter } from '@masknet/web3-providers'
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
        staleTime: 60_000,
        retry: 0,
        queryFn: () => {
            if (!userId) return null
            return Twitter.getUserByScreenName(userId)
        },
    })

    if (!userId || !user) return null

    return (
        <NFTBadgeTimeline
            classes={{ root: className }}
            userId={userId}
            avatarId={Twitter.getAvatarId(user.avatarURL)}
            height={size}
            width={size}
        />
    )
}
