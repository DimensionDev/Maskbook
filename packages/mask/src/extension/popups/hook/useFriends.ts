import { useAsyncRetry } from 'react-use'
import { type ECKeyIdentifier, EMPTY_LIST, type BindingProof, type ProfileInformation } from '@masknet/shared-base'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry.js'
import { useCurrentPersona } from '../../../components/DataSource/usePersonaConnectStatus.js'
import Services from '../../../extension/service.js'
import { NextIDProof } from '@masknet/web3-providers'

export type FriendsInformation = ProfileInformation & {
    profiles: BindingProof[]
} & { id: string }

export function useFriends(network: string): AsyncStateRetry<FriendsInformation[]> {
    const currentPersona = useCurrentPersona()

    return useAsyncRetry(async () => {
        const values = await Services.Identity.queryRelationPaged(
            currentPersona?.identifier,
            {
                network,
                pageOffset: 0,
            },
            1000,
        )
        if (values.length === 0) return EMPTY_LIST

        const identifiers = values.map((x) => x.profile)
        const res = await Services.Identity.queryProfilesInformation(identifiers)
        const friends = res.filter((item) => item.linkedPersona !== undefined)
        const profiles: FriendsInformation[] = []
        friends.forEach(async (item) => {
            const id = (item.linkedPersona as ECKeyIdentifier).publicKeyAsHex
            const res = await NextIDProof.queryProfilesByPublicKey(id)
            profiles.push({ ...item, profiles: res, id })
        })
        return new Promise((resolve) => {
            resolve(profiles)
        })
    }, [network, currentPersona])
}
