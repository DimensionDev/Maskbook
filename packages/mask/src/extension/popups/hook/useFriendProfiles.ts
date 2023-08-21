import {
    type ECKeyIdentifier,
    type BindingProof,
    NextIDPlatform,
    type ProfileIdentifier,
    EMPTY_LIST,
} from '@masknet/shared-base'
import { useCurrentPersona } from '../../../components/DataSource/useCurrentPersona.js'
import { useQuery } from '@tanstack/react-query'
import { NextIDProof } from '@masknet/web3-providers'

export type FriendsInformation = Friend & {
    profiles: BindingProof[]
    id: string
}

export type Friend = {
    persona: ECKeyIdentifier
    profile?: ProfileIdentifier
    avatar?: string
}

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

export const profilesFilter = (x: BindingProof) => {
    return (
        (x.platform === NextIDPlatform.ENS && x.name.endsWith('.eth')) ||
        (x.platform !== NextIDPlatform.Bit &&
            x.platform !== NextIDPlatform.CyberConnect &&
            x.platform !== NextIDPlatform.REDDIT &&
            x.platform !== NextIDPlatform.SYBIL &&
            x.platform !== NextIDPlatform.EthLeaderboard &&
            x.platform !== NextIDPlatform.NextID)
    )
}

export function useFriendProfiles(seen: boolean, nextId?: string, twitterId?: string) {
    const currentPersona = useCurrentPersona()

    const { data: profiles } = useQuery(
        ['profiles', currentPersona?.identifier.publicKeyAsHex, nextId],
        async () => {
            if (!nextId) return EMPTY_LIST
            try {
                return await NextIDProof.queryProfilesByPublicKey(nextId, 2)
            } catch (error) {
                return EMPTY_LIST
            }
        },
        {
            enabled: seen && !!nextId,
        },
    )
    if (!profiles) return EMPTY_LIST
    if (profiles.length === 0) {
        if (twitterId) {
            return [
                {
                    platform: NextIDPlatform.Twitter,
                    identity: twitterId,
                    is_valid: true,
                    last_checked_at: '',
                    name: twitterId,
                    created_at: '',
                },
            ]
        } else {
            return EMPTY_LIST
        }
    }
    const filtered = profiles.filter(profilesFilter).sort((a, b) => PlatformSort[a.platform] - PlatformSort[b.platform])
    return filtered
}
