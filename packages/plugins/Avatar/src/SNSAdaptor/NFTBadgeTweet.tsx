import { NFTBadgeTimeline } from './NFTBadgeTimeline.js'
import type { RSS3_KEY_SNS } from '../constants.js'
import type { IdentityResolved } from '@masknet/plugin-infra/content-script'
import type { UnboundedRegistry } from '@dimensiondev/holoflows-kit'
import type { NFTAvatarEvent } from '@masknet/shared-base'

interface NFTBadgeTweetProps {
    identity?: IdentityResolved
    avatarId: string
    width: number
    height: number
    snsKey: RSS3_KEY_SNS
    timelineUpdated: UnboundedRegistry<NFTAvatarEvent>
}

export function NFTBadgeTweet(props: NFTBadgeTweetProps) {
    const { avatarId, width, height, snsKey, identity, timelineUpdated } = props
    if (!identity?.identifier?.userId) return null
    return (
        <NFTBadgeTimeline
            timelineUpdated={timelineUpdated}
            width={width}
            height={height}
            userId={identity.identifier.userId}
            avatarId={avatarId}
            snsKey={snsKey}
        />
    )
}
