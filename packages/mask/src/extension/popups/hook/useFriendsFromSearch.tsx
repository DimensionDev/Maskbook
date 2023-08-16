import { useAsyncRetry } from 'react-use'
import { ECKeyIdentifier, EMPTY_LIST, type NextIDPersonaBindings } from '@masknet/shared-base'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry.js'
import { uniqBy } from 'lodash-es'
import type { FriendsInformation } from './useFriends.js'
import { NextIDPlatform } from '@masknet/shared-base'
import { PlatformSort } from './useFriends.js'

export type NextIDPersonaBindingsWithIdentifier = NextIDPersonaBindings & { linkedPersona: ECKeyIdentifier } & {
    isLocal?: boolean
}

export function useFriendsFromSearch(
    searchResult?: NextIDPersonaBindings[],
    localList?: FriendsInformation[],
    searchValue?: string,
): AsyncStateRetry<NextIDPersonaBindingsWithIdentifier[]> {
    return useAsyncRetry(async () => {
        if (!searchResult?.length) return EMPTY_LIST
        const profiles: NextIDPersonaBindingsWithIdentifier[] = searchResult.map((item, index) => {
            const filtered = item.proofs.filter(
                (x) =>
                    (x.platform === NextIDPlatform.ENS && x.name.endsWith('.eth')) ||
                    (x.platform !== NextIDPlatform.Bit &&
                        x.platform !== NextIDPlatform.CyberConnect &&
                        x.platform !== NextIDPlatform.REDDIT &&
                        x.platform !== NextIDPlatform.SYBIL &&
                        x.platform !== NextIDPlatform.EthLeaderboard &&
                        x.platform !== NextIDPlatform.NextID),
            )
            const identifier = ECKeyIdentifier.fromHexPublicKeyK256(item.persona).expect(
                `${item.persona} should be a valid hex public key in k256`,
            )
            filtered.sort((a, b) => PlatformSort[a.platform] - PlatformSort[b.platform])
            const searchItem = filtered.findIndex((x) => x.identity === searchValue || x.name === searchValue)
            if (searchItem !== -1) filtered.unshift(filtered.splice(searchItem, 1)[0])
            return {
                proofs: uniqBy(filtered, ({ identity }) => identity),
                linkedPersona: identifier,
                activated_at: item.activated_at,
                persona: item.persona,
                isLocal: localList
                    ? localList.some((x) => x.persona.publicKeyAsHex === identifier.publicKeyAsHex)
                    : false,
            }
        })
        return uniqBy(profiles, ({ linkedPersona }) => linkedPersona.publicKeyAsHex)
    }, [searchResult, localList])
}
