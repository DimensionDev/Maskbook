import { useMemo } from 'react'
import { uniqBy } from 'lodash-es'
import { ECKeyIdentifier, EMPTY_LIST, type NextIDPersonaBindings } from '@masknet/shared-base'
import { useCurrentLinkedPersona } from '@masknet/shared'
import type { Friend } from './useFriends.js'
import { profilesFilter } from './useFriendProfiles.js'
import { PlatformSort, type FriendNetwork, type Profile } from '../pages/Friends/common.js'

export type NextIDPersonaBindingsWithIdentifier = Omit<NextIDPersonaBindings, 'proofs'> & {
    proofs: Profile[]
    linkedPersona: ECKeyIdentifier
    isLocal?: boolean
    avatar?: string
}

export function useFriendsFromSearch(
    localSearchedResult: Friend[],
    searchResult?: NextIDPersonaBindings[],
    localList?: Friend[],
    searchValue?: string,
): NextIDPersonaBindingsWithIdentifier[] {
    const currentIdentifier = useCurrentLinkedPersona()
    return useMemo(() => {
        if (!searchResult?.length && !localSearchedResult?.length) return EMPTY_LIST
        const localProfiles: NextIDPersonaBindingsWithIdentifier[] = localSearchedResult
            .filter((x) => x.persona.publicKeyAsHex !== currentIdentifier?.identifier.publicKeyAsHex && x.profile)
            .map((item) => {
                const profile = item.profile!
                return {
                    proofs: [
                        {
                            platform: profile.network as FriendNetwork,
                            identity: profile.userId,
                            is_valid: true,
                            last_checked_at: '',
                            name: profile.userId,
                            created_at: '',
                        },
                    ],
                    linkedPersona: item.persona,
                    activated_at: '',
                    persona: item.persona.publicKeyAsHex,
                    isLocal: true,
                    avatar: item.avatar,
                }
            })
        const profiles: NextIDPersonaBindingsWithIdentifier[] =
            searchResult ?
                searchResult
                    .filter((x) => x.persona !== currentIdentifier?.identifier.publicKeyAsHex)
                    .map((item) => {
                        const filtered = item.proofs.filter(profilesFilter)
                        const identifier = ECKeyIdentifier.fromHexPublicKeyK256(item.persona).expect(
                            `${item.persona} should be a valid hex public key in k256`,
                        )
                        filtered.sort((a, b) => PlatformSort[a.platform] - PlatformSort[b.platform])
                        const searchItem = filtered.findIndex(
                            (x) => x.identity === searchValue || x.name === searchValue,
                        )
                        if (searchItem !== -1) filtered.unshift(filtered.splice(searchItem, 1)[0])
                        return {
                            proofs: uniqBy(filtered, ({ identity }) => identity),
                            linkedPersona: identifier,
                            activated_at: item.activated_at,
                            persona: item.persona,
                            isLocal:
                                localList ?
                                    localList.some((x) => x.persona.publicKeyAsHex === identifier.publicKeyAsHex)
                                :   false,
                        }
                    })
            :   EMPTY_LIST
        return uniqBy(
            localProfiles ? localProfiles.concat(profiles) : profiles,
            ({ linkedPersona }) => linkedPersona.publicKeyAsHex,
        )
    }, [searchResult, localList, currentIdentifier, localSearchedResult])
}
