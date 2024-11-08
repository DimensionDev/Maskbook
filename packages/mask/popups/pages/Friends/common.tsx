import { Icons, type GeneratedIcon } from '@masknet/icons'
import { NextIDPlatform, type BindingProof, type EnhanceableSite } from '@masknet/shared-base'

export type Profile = Omit<BindingProof, 'platform'> & {
    platform: NextIDPlatform | EnhanceableSite.Twitter | EnhanceableSite.Facebook | EnhanceableSite.Instagram
}

export type FriendNetwork = EnhanceableSite.Twitter | EnhanceableSite.Facebook | EnhanceableSite.Instagram

export type SupportedPlatforms =
    | NextIDPlatform.Ethereum
    | NextIDPlatform.GitHub
    | NextIDPlatform.ENS
    | NextIDPlatform.LENS
    | NextIDPlatform.SpaceId
    | NextIDPlatform.Farcaster
    | NextIDPlatform.Unstoppable
    | NextIDPlatform.Keybase

export const PlatformUrlMap: Record<SupportedPlatforms, string> = {
    [NextIDPlatform.ENS]: 'https://app.ens.domains/name/',
    [NextIDPlatform.Unstoppable]: 'https://ud.me/',
    [NextIDPlatform.GitHub]: 'https://github.com/',
    [NextIDPlatform.SpaceId]: 'https://bscscan.com/address/',
    [NextIDPlatform.Farcaster]: 'https://firefly.mask.social/profile/farcaster/',
    [NextIDPlatform.LENS]: 'https://firefly.mask.social/profile/lens/',
    [NextIDPlatform.Ethereum]: 'https://etherscan.io/address/',
    [NextIDPlatform.Keybase]: 'https://keybase.io/',
}

export const PlatformIconMap: Record<SupportedPlatforms, GeneratedIcon> = {
    [NextIDPlatform.LENS]: Icons.Lens,
    [NextIDPlatform.Ethereum]: Icons.ETH,
    [NextIDPlatform.ENS]: Icons.ENS,
    [NextIDPlatform.GitHub]: Icons.GitHub,
    [NextIDPlatform.Farcaster]: Icons.Farcaster,
    [NextIDPlatform.SpaceId]: Icons.SpaceId,
    [NextIDPlatform.Unstoppable]: Icons.Unstoppable,
    [NextIDPlatform.Keybase]: Icons.Keybase,
}

export const UnsupportedPlatforms = [
    NextIDPlatform.Bit,
    NextIDPlatform.CyberConnect,
    NextIDPlatform.REDDIT,
    NextIDPlatform.SYBIL,
    NextIDPlatform.EthLeaderboard,
    NextIDPlatform.NextID,
]

export const PlatformSort: Record<NextIDPlatform, number> = {
    [NextIDPlatform.Twitter]: 0,
    [NextIDPlatform.GitHub]: 1,
    [NextIDPlatform.Ethereum]: 2,
    [NextIDPlatform.ENS]: 3,
    [NextIDPlatform.LENS]: 4,
    [NextIDPlatform.Keybase]: 5,
    [NextIDPlatform.Farcaster]: 6,
    [NextIDPlatform.SpaceId]: 7,
    [NextIDPlatform.Unstoppable]: 8,
    [NextIDPlatform.RSS3]: 9,
    [NextIDPlatform.REDDIT]: 10,
    [NextIDPlatform.SYBIL]: 11,
    [NextIDPlatform.EthLeaderboard]: 12,
    [NextIDPlatform.Bit]: 13,
    [NextIDPlatform.CyberConnect]: 14,
    [NextIDPlatform.NextID]: 15,
}
