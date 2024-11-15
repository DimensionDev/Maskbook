import { createLookupTableResolver, NextIDPlatform } from '@masknet/shared-base'
import { type GeneratedIcon, Icons } from '@masknet/icons'

export const resolveNextIDPlatformIcon = createLookupTableResolver<NextIDPlatform, GeneratedIcon | null>(
    {
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
    },
    Icons.Web,
)
