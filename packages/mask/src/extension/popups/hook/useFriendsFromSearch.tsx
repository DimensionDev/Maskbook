import { useAsyncRetry } from 'react-use'
import { ECKeyIdentifier, EMPTY_LIST, type NextIDPersonaBindings } from '@masknet/shared-base'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry.js'

export type NextIDPersonaBindingsWithIdentifier = NextIDPersonaBindings & { linkedPersona: ECKeyIdentifier }

export function useFriendsFromSearch(
    searchResult?: NextIDPersonaBindings[],
): AsyncStateRetry<NextIDPersonaBindingsWithIdentifier[]> {
    return useAsyncRetry(async () => {
        if (!searchResult?.length) return EMPTY_LIST
        const profiles: NextIDPersonaBindingsWithIdentifier[] = []
        searchResult.forEach((item, index) => {
            const filtered = item.proofs.filter(
                (x) =>
                    x.platform === 'twitter' ||
                    x.platform === 'lens' ||
                    x.platform === 'ens' ||
                    x.platform === 'ethereum' ||
                    x.platform === 'github' ||
                    x.platform === 'space_id' ||
                    x.platform === 'farcaster' ||
                    x.platform === 'unstoppabledomains',
            )
            const identifier = ECKeyIdentifier.fromHexPublicKeyK256(item.persona).expect(
                `${item.persona} should be a valid hex public key in k256`,
            )
            profiles.push({
                proofs: filtered,
                linkedPersona: identifier,
                activated_at: item.activated_at,
                persona: item.persona,
            })
        })
        return profiles
    }, [searchResult])
}
