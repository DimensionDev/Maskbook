import { useAsyncRetry } from 'react-use'
import { ECKeyIdentifier, EMPTY_LIST, type BindingProof, type ProfileInformation } from '@masknet/shared-base'
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
        const promiseArray: Array<Promise<BindingProof[]>> = []
        friends.forEach(async (item) => {
            const id = (item.linkedPersona as ECKeyIdentifier).publicKeyAsHex
            promiseArray.push(NextIDProof.queryProfilesByPublicKey(id))
        })
        const results = await Promise.allSettled(promiseArray)
        results.forEach((item, index) => {
            if (item.status !== 'rejected') {
                const filtered = item.value.filter(
                    (x) =>
                        x.platform === 'twitter' ||
                        x.platform === 'lens' ||
                        x.platform === 'ens' ||
                        x.platform === 'ethereum',
                )
                profiles.push({
                    profiles: filtered,
                    ...friends[index],
                    id: (friends[index].linkedPersona as ECKeyIdentifier).publicKeyAsHex,
                })
            }
            return
        })
        return profiles
    }, [network, currentPersona])
}

export function useFriend(network: string, id: string): AsyncStateRetry<FriendsInformation> {
    return useAsyncRetry(async () => {
        ECKeyIdentifier.fromHexPublicKeyK256(id)
        const res = {} as FriendsInformation
        res.profiles = await NextIDProof.queryProfilesByPublicKey(id)
        return res
    }, [network, id])
}
