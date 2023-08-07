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
                network: 'all',
                pageOffset: 0,
            },
            1000,
        )
        if (values.length === 0) return EMPTY_LIST
        const friends = (await Services.Identity.queryProfilesInformation(values.map((x) => x.profile))).filter(
            (item) => item.linkedPersona !== undefined,
        )
        const allSettled = await Promise.allSettled(
            friends.map((item) => {
                const id = (item.linkedPersona as ECKeyIdentifier).publicKeyAsHex
                return NextIDProof.queryProfilesByPublicKey(id)
            }),
        )
        const profiles: FriendsInformation[] = allSettled.map((item, index) => {
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
                    x.platform === NextIDPlatform.Twitter ||
                    x.platform === NextIDPlatform.LENS ||
                    x.platform === NextIDPlatform.ENS ||
                    x.platform === NextIDPlatform.Ethereum ||
                    x.platform === NextIDPlatform.GitHub ||
                    x.platform === NextIDPlatform.SpaceId ||
                    x.platform === NextIDPlatform.Farcaster ||
                    x.platform === NextIDPlatform.Unstoppable,
            )
            return {
                profiles: filtered,
                ...friends[index],
                id: (friends[index].linkedPersona as ECKeyIdentifier).publicKeyAsHex,
            }
        })
        return uniqBy(profiles, ({ id }) => id).reverse()
    }, [network, currentPersona])
}
