import { createLookupTableResolver, NextIDPlatform } from '@masknet/shared-base'
import { type GeneratedIcon, Icons } from '@masknet/icons'

export const resolveNextIDPlatformIcon = createLookupTableResolver<NextIDPlatform, GeneratedIcon | null>(
    {
        [NextIDPlatform.Ethereum]: Icons.ETH,
        [NextIDPlatform.NextID]: null,
        [NextIDPlatform.GitHub]: Icons.GitHub,
        [NextIDPlatform.Keybase]: Icons.Keybase,
        [NextIDPlatform.Twitter]: Icons.TwitterRound,
        [NextIDPlatform.ENS]: Icons.ENS,
        [NextIDPlatform.RSS3]: null,
        [NextIDPlatform.LENS]: Icons.Lens,
        [NextIDPlatform.REDDIT]: Icons.RedditRound,
        [NextIDPlatform.SYBIL]: null,
        [NextIDPlatform.EthLeaderboard]: null,
        [NextIDPlatform.SpaceId]: null,
        [NextIDPlatform.Farcaster]: null,
        [NextIDPlatform.Bit]: null,
        [NextIDPlatform.Unstoppable]: null,
        [NextIDPlatform.CyberConnect]: null,
    },
    null,
)
