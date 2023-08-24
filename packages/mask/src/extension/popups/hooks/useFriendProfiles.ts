import { EMPTY_LIST, NextIDPlatform, type BindingProof } from '@masknet/shared-base'
import { NextIDProof } from '@masknet/web3-providers'
import { useQuery } from '@tanstack/react-query'
import { useCurrentPersona } from '../../../components/DataSource/useCurrentPersona.js'
import { PlatformSort, UnsupportedPlatforms } from '../pages/Friends/common.js'

export const profilesFilter = (x: BindingProof) => {
    return (x.platform === NextIDPlatform.ENS && x.name.endsWith('.eth')) || !UnsupportedPlatforms.includes(x.platform)
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
