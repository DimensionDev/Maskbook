import { NextIDPlatform } from '@masknet/shared-base'
import { type GeneratedIconProps, Icons } from '@masknet/icons'

const table = {
    [NextIDPlatform.Ethereum]: Icons.ETH,
    [NextIDPlatform.NextID]: null,
    [NextIDPlatform.GitHub]: Icons.GitHub,
    [NextIDPlatform.Keybase]: Icons.Keybase,
    [NextIDPlatform.Twitter]: Icons.TwitterXRound,
    [NextIDPlatform.ENS]: Icons.ENS,
    [NextIDPlatform.RSS3]: null,
    [NextIDPlatform.LENS]: Icons.DarkLens,
    [NextIDPlatform.REDDIT]: Icons.RedditRound,
    [NextIDPlatform.SYBIL]: null,
    [NextIDPlatform.EthLeaderboard]: null,
    [NextIDPlatform.SpaceId]: Icons.SpaceId,
    [NextIDPlatform.Farcaster]: Icons.Farcaster,
    [NextIDPlatform.Bit]: Icons.Bit,
    [NextIDPlatform.Unstoppable]: Icons.Unstoppable,
    [NextIDPlatform.CyberConnect]: Icons.CyberConnect,
}
export function NextIDPlatformIcon({ platform, ...rest }: GeneratedIconProps & { platform: NextIDPlatform }) {
    const icon = table[platform]
    if (!icon) return null
    const IconComponent = icon
    return <IconComponent {...rest} />
}
