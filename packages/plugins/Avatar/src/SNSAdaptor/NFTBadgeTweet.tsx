import { NFTBadgeTimeline } from './NFTBadgeTimeline.js'
import type { RSS3_KEY_SNS } from '../constants.js'
import { useLastRecognizedIdentity } from '@masknet/plugin-infra/content-script'

interface NFTBadgeTweetProps {
    avatarId: string
    width: number
    height: number
    snsKey: RSS3_KEY_SNS
}

export function NFTBadgeTweet(props: NFTBadgeTweetProps) {
    const { avatarId, width, height, snsKey } = props
    const identity = useLastRecognizedIdentity()

    if (!identity?.identifier?.userId) return null
    return (
        <NFTBadgeTimeline
            width={width}
            height={height}
            userId={identity?.identifier.userId}
            avatarId={avatarId}
            snsKey={snsKey}
        />
    )
}
