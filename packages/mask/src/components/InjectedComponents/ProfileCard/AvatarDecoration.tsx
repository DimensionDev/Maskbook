import { Twitter } from '@masknet/web3-providers'
import type { FC } from 'react'
import { useAsync } from 'react-use'
import { RSS3_KEY_SNS } from '../../../plugins/Avatar/constants.js'
import { NFTAvatarMiniClip } from '../../../plugins/Avatar/SNSAdaptor/NFTAvatarClip.js'
import { NFTBadgeTimeline } from '../../../plugins/Avatar/SNSAdaptor/NFTBadgeTimeline.js'

interface Props {
    className?: string
    clipPathId: string
    size: number
    userId?: string
}
export const AvatarDecoration: FC<Props> = ({ clipPathId, userId, className, size }) => {
    const { value: user } = useAsync(async () => {
        if (!userId) return null
        return Twitter.getUserByScreenName(userId, true)
    }, [userId])

    if (!userId || !user) return null

    const avatarId = Twitter.getAvatarId(user.legacy?.profile_image_url_https)

    return user.has_nft_avatar ? (
        <NFTAvatarMiniClip className={className} id={clipPathId} height={size} width={size} screenName={userId} />
    ) : (
        <NFTBadgeTimeline
            classes={{ root: className }}
            userId={userId}
            avatarId={avatarId}
            height={size}
            width={size}
            snsKey={RSS3_KEY_SNS.TWITTER}
        />
    )
}
