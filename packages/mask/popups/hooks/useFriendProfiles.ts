import {
    EMPTY_LIST,
    NextIDPlatform,
    type BindingProof,
    type ProfileIdentifier,
    type EnhanceableSite,
} from '@masknet/shared-base'
import { NextIDProof } from '@masknet/web3-providers'
import { useQuery } from '@tanstack/react-query'
import { useCurrentPersona } from '../../shared-ui/hooks/index.js'
import { PlatformSort, UnsupportedPlatforms } from '../pages/Friends/common.js'
import { useMemo } from 'react'

export function profilesFilter(x: BindingProof) {
    return (x.platform === NextIDPlatform.ENS && x.name.endsWith('.eth')) || !UnsupportedPlatforms.includes(x.platform)
}

export function useFriendProfiles(seen: boolean, nextId?: string, profile?: ProfileIdentifier) {
    const currentPersona = useCurrentPersona()

    const { data: profiles = EMPTY_LIST } = useQuery({
        queryKey: ['profiles', currentPersona?.identifier.publicKeyAsHex, nextId],
        queryFn: async () => {
            if (!nextId) return EMPTY_LIST
            try {
                return await NextIDProof.queryProfilesByPublicKey(nextId, 2)
            } catch (error) {
                return EMPTY_LIST
            }
        },
        enabled: seen && !!nextId,
    })
    return useMemo(() => {
        if (profiles.length === 0) {
            if (profile?.userId) {
                return [
                    {
                        platform: profile?.network as
                            | EnhanceableSite.Twitter
                            | EnhanceableSite.Facebook
                            | EnhanceableSite.Instagram,
                        identity: profile.userId,
                        is_valid: true,
                        last_checked_at: '',
                        name: profile.userId,
                        created_at: '',
                    },
                ]
            } else {
                return EMPTY_LIST
            }
        }
        return profiles.filter(profilesFilter).sort((a, b) => PlatformSort[a.platform] - PlatformSort[b.platform])
    }, [profiles])
}
