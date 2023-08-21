import { Icons, type GeneratedIcon } from '@masknet/icons'
import { NextIDPlatform } from '@masknet/shared-base'

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
    [NextIDPlatform.Farcaster]: 'https://warpcast.com/',
    [NextIDPlatform.LENS]: 'https://lenster.xyz/u/',
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
