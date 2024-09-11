import { Twitter } from '@masknet/web3-providers'
import { NFTBadgeTimeline } from '@masknet/plugin-avatar'
import { useQuery } from '@tanstack/react-query'

interface Props {
    className?: string
    size: number
    userId?: string
}
export function AvatarDecoration({ userId, className, size }: Props) {
    const identity = userId?.toLowerCase()
    const { data: user } = useQuery({
        queryKey: ['twitter', 'profile', identity],
        retry: 0,
        staleTime: 300_000,
        queryFn: () => {
            if (!identity) return null
            return Twitter.getUserByScreenName(identity)
        },
    })

    if (!identity || !user) return null

    return (
        <NFTBadgeTimeline
            classes={{ root: className }}
            userId={identity}
            avatarId={Twitter.getAvatarId(user.avatarURL)}
            height={size}
            width={size}
        />
    )
}
