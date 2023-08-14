import { NFTBadgeTimeline } from './NFTBadgeTimeline.js'
import type { RSS3_KEY_SITE } from '../constants.js'
import type { IdentityResolved } from '@masknet/plugin-infra/content-script'

interface NFTBadgeTweetProps {
    identity?: IdentityResolved
    avatarId: string
    width: number
    height: number
    siteKey: RSS3_KEY_SITE
}

export function NFTBadgeTweet(props: NFTBadgeTweetProps) {
    const { avatarId, width, height, siteKey, identity } = props
    if (!identity?.identifier?.userId) return null
    return (
        <NFTBadgeTimeline
            width={width}
            height={height}
            userId={identity?.identifier.userId}
            avatarId={avatarId}
            siteKey={siteKey}
        />
    )
}
