import { useAsyncRetry } from 'react-use'
import {
    type ECKeyIdentifier,
    EMPTY_LIST,
    type BindingProof,
    NextIDPlatform,
    type ProfileIdentifier,
} from '@masknet/shared-base'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry.js'
import { useCurrentPersona } from '../../../components/DataSource/useCurrentPersona.js'
import Services from '../../../extension/service.js'
import { NextIDProof } from '@masknet/web3-providers'
import { first, uniqBy } from 'lodash-es'
import { isProfileIdentifier } from '@masknet/shared'

export type FriendsInformation = Friend & {
    profiles: BindingProof[]
    id: string
}

type Friend = {
    persona: ECKeyIdentifier
    profile?: ProfileIdentifier
    avatar?: string
}

export const PlatformSort: Record<NextIDPlatform, number> = {
    [NextIDPlatform.Twitter]: 0,
    [NextIDPlatform.GitHub]: 1,
    [NextIDPlatform.Ethereum]: 2,
    [NextIDPlatform.ENS]: 3,
    [NextIDPlatform.LENS]: 4,
    [NextIDPlatform.Keybase]: 5,
    [NextIDPlatform.Farcaster]: 6,
    [NextIDPlatform.SpaceId]: 7,
    [NextIDPlatform.Unstoppable]: 8,
    [NextIDPlatform.RSS3]: 9,
    [NextIDPlatform.REDDIT]: 10,
    [NextIDPlatform.SYBIL]: 11,
    [NextIDPlatform.EthLeaderboard]: 12,
    [NextIDPlatform.Bit]: 13,
    [NextIDPlatform.CyberConnect]: 14,
    [NextIDPlatform.NextID]: 15,
}

function emptyFilter(x: Friend | undefined): x is Friend {
    return x !== undefined
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
        const friends: Friend[] = (
            await Promise.all<Promise<Friend | undefined>>(
                values.map(async (x) => {
                    if (isProfileIdentifier(x.profile)) {
                        const res = first(await Services.Identity.queryProfilesInformation([x.profile]))
                        if (res?.linkedPersona !== undefined && res?.linkedPersona !== currentPersona?.identifier)
                            return {
                                persona: res.linkedPersona,
                                profile: x.profile,
                                avatar: res.avatar,
                            }
                        return
                    } else {
                        if (x.profile !== currentPersona?.identifier) return { persona: x.profile }
                        return
                    }
                }),
            )
        ).filter(emptyFilter)
        const allSettled = await Promise.allSettled(
            friends.map((item) => {
                const id = item.persona.publicKeyAsHex
                return NextIDProof.queryProfilesByPublicKey(id, 2)
            }),
        )
        const profiles: FriendsInformation[] = allSettled.map((item, index) => {
            if (item.status === 'rejected') {
                if (friends[index].profile) {
                    return {
                        profiles: [
                            {
                                platform: NextIDPlatform.Twitter,
                                identity: friends[index].profile!.userId,
                                is_valid: true,
                                last_checked_at: '',
                                name: friends[index].profile!.userId,
                                created_at: '',
                            },
                        ],
                        ...friends[index],
                        id: friends[index].persona.publicKeyAsHex,
                    }
                } else {
                    return {
                        profiles: [],
                        ...friends[index],
                        id: friends[index].persona.publicKeyAsHex,
                    }
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

            filtered.sort((a, b) => PlatformSort[a.platform] - PlatformSort[b.platform])
            return {
                profiles: filtered,
                ...friends[index],
                id: friends[index].persona.publicKeyAsHex,
            }
        })
        return uniqBy(profiles, ({ id }) => id)
    }, [currentPersona])
}
