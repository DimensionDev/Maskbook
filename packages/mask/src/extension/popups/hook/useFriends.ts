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
export const PlatformSort = {
    twitter: 0,
    github: 1,
    ethereum: 2,
    ens: 3,
    lens: 4,
    keybase: 5,
    farcaster: 6,
    space_id: 7,
    unstoppabledomains: 8,
}
export function useFriends(): AsyncStateRetry<FriendsInformation[]> {
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
                return NextIDProof.queryProfilesByPublicKey(id, 2)
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
                    (x.platform === NextIDPlatform.ENS && x.name.endsWith('.eth')) ||
                    (x.platform !== NextIDPlatform.Bit &&
                        x.platform !== NextIDPlatform.CyberConnect &&
                        x.platform !== NextIDPlatform.REDDIT &&
                        x.platform !== NextIDPlatform.SYBIL &&
                        x.platform !== NextIDPlatform.EthLeaderboard &&
                        x.platform !== NextIDPlatform.NextID),
            )

            filtered.sort(
                (a, b) =>
                    PlatformSort[a.platform as keyof typeof PlatformSort] -
                    PlatformSort[b.platform as keyof typeof PlatformSort],
            )
            return {
                profiles: filtered,
                ...friends[index],
                id: (friends[index].linkedPersona as ECKeyIdentifier).publicKeyAsHex,
            }
        })
        return uniqBy(profiles, ({ id }) => id).reverse()
    }, [currentPersona])
}
