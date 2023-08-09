import { useAsyncRetry } from 'react-use'
import { ECKeyIdentifier, EMPTY_LIST, type NextIDPersonaBindings } from '@masknet/shared-base'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry.js'
import { uniqBy } from 'lodash-es'
import type { FriendsInformation } from './useFriends.js'
import { NextIDPlatform } from '@masknet/shared-base'

export type NextIDPersonaBindingsWithIdentifier = NextIDPersonaBindings & { linkedPersona: ECKeyIdentifier } & {
    isLocal?: boolean
}

export function useFriendsFromSearch(
    searchResult?: NextIDPersonaBindings[],
    localList?: FriendsInformation[],
): AsyncStateRetry<NextIDPersonaBindingsWithIdentifier[]> {
    return useAsyncRetry(async () => {
        if (!searchResult?.length) return EMPTY_LIST
        const profiles: NextIDPersonaBindingsWithIdentifier[] = searchResult.map((item, index) => {
            const filtered = item.proofs.filter(
                (x) =>
                    x.platform !== NextIDPlatform.Bit &&
                    x.platform !== NextIDPlatform.CyberConnect &&
                    x.platform !== NextIDPlatform.REDDIT &&
                    x.platform !== NextIDPlatform.SYBIL &&
                    x.platform !== NextIDPlatform.EthLeaderboard &&
                    x.platform !== NextIDPlatform.NextID,
            )
            const identifier = ECKeyIdentifier.fromHexPublicKeyK256(item.persona).expect(
                `${item.persona} should be a valid hex public key in k256`,
            )
            return {
                proofs: filtered,
                linkedPersona: identifier,
                activated_at: item.activated_at,
                persona: item.persona,
                isLocal: localList
                    ? localList.some((x) => x.linkedPersona?.publicKeyAsHex === identifier.publicKeyAsHex)
                    : false,
            }
        })
        return uniqBy(profiles, ({ linkedPersona }) => linkedPersona.publicKeyAsHex)
    }, [searchResult, localList])
}
