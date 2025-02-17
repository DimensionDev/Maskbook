import { EMPTY_LIST, type EnhanceableSite, NextIDPlatform, type ProfileIdentifier } from '@masknet/shared-base'
import { Web3Bio } from '@masknet/web3-providers'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useCurrentPersona } from '../../shared-ui/hooks/index.js'
import { PlatformSort, UnsupportedPlatforms, type Profile } from '../pages/Friends/common.js'

export function profilesFilter(x: Profile) {
    return (
        (x.platform === NextIDPlatform.ENS && x.name.endsWith('.eth')) ||
        !UnsupportedPlatforms.includes(x.platform as NextIDPlatform)
    )
}

export function useFriendProfiles(seen: boolean, nextId?: string, profile?: ProfileIdentifier): Profile[] {
    const currentPersona = useCurrentPersona()

    const { data: profiles = EMPTY_LIST } = useQuery({
        enabled: seen && !!nextId,
        queryKey: ['profiles', currentPersona?.identifier.publicKeyAsHex, nextId],
        queryFn: async () => {
            if (!nextId) return EMPTY_LIST
            try {
                return await Web3Bio.getProfilesByNextId(nextId)
            } catch (error) {
                return EMPTY_LIST
            }
        },
        select(profiles) {
            return profiles.map((profile) => ({
                platform: profile.platform,
                identity: profile.identity,
                is_valid: true,
                last_checked_at: '',
                name: profile.displayName,
                created_at: '',
            }))
        },
    })
    return useMemo(() => {
        if (profiles.length === 0) {
            if (profile?.userId) {
                return [
                    {
                        platform: profile.network as
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
        return profiles.sort((a, b) => PlatformSort[a.platform] - PlatformSort[b.platform])
    }, [profiles])
}
