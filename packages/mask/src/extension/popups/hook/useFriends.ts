import { useAsyncRetry } from 'react-use'
import {
    type ECKeyIdentifier,
    EMPTY_LIST,
    type BindingProof,
    type ProfileInformation,
    NextIDPlatform,
} from '@masknet/shared-base'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry.js'
import { useCurrentPersona } from '../../../components/DataSource/usePersonaConnectStatus.js'
import Services from '../../../extension/service.js'
import { NextIDProof } from '@masknet/web3-providers'
import { uniqBy } from 'lodash-es'

export type FriendsInformation = ProfileInformation & {
    profiles: BindingProof[]
    id: string
}

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
        const promiseArray: Array<Promise<BindingProof[]>> = friends.map((item) => {
            const id = (item.linkedPersona as ECKeyIdentifier).publicKeyAsHex
            return NextIDProof.queryProfilesByPublicKey(id)
        })
        const results = await Promise.allSettled(promiseArray)
        const profiles: FriendsInformation[] = results.map((item, index) => {
            if (!(item.status !== 'rejected')) {
                return {
                    profiles: [
                        {
                            platform: NextIDPlatform.Twitter,
                            identity: friends[index].identifier.userId,
                            is_valid: true,
                            last_checked_at: '',
                            name: friends[index].identifier.userId,
                            created_at: '',
                        },
                    ],
                    ...friends[index],
                    id: (friends[index].linkedPersona as ECKeyIdentifier).publicKeyAsHex,
                }
            }
            const filtered = item.value.filter(
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
            return {
                profiles: filtered,
                ...friends[index],
                id: (friends[index].linkedPersona as ECKeyIdentifier).publicKeyAsHex,
            }
        })
        return uniqBy(profiles, ({ id }) => id)
    }, [network, currentPersona])
}
