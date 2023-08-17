import {
    type ECKeyIdentifier,
    EMPTY_LIST,
    type BindingProof,
    NextIDPlatform,
    type ProfileIdentifier,
} from '@masknet/shared-base'
import { useCurrentPersona } from '../../../components/DataSource/useCurrentPersona.js'
import Services from '../../../extension/service.js'
import { NextIDProof } from '@masknet/web3-providers'
import { first, uniqBy } from 'lodash-es'
import { isProfileIdentifier } from '@masknet/shared'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'

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

export function useFriendsPaged() {
    const currentPersona = useCurrentPersona()
    const { data: records = EMPTY_LIST, isLoading } = useQuery(['relation-records', currentPersona], async () => {
        return Services.Identity.queryRelationPaged(
            currentPersona?.identifier,
            {
                network: 'all',
                pageOffset: 0,
            },
            3000,
        )
    })
    return useInfiniteQuery({
        queryKey: ['friends', currentPersona],
        enabled: !isLoading,
        queryFn: async ({ pageParam }) => {
            const friends: Friend[] = []
            const startIndex = pageParam ? Number(pageParam) : 0
            let nextPageOffset = 0
            for (let i = startIndex; i < records.length; i += 1) {
                nextPageOffset = i
                if (friends.length === 10) break
                const x = records[i]
                if (isProfileIdentifier(x.profile)) {
                    const res = first(await Services.Identity.queryProfilesInformation([x.profile]))
                    if (res?.linkedPersona !== undefined && res?.linkedPersona !== currentPersona?.identifier)
                        friends.push({
                            persona: res.linkedPersona,
                            profile: x.profile,
                            avatar: res.avatar,
                        })
                } else {
                    if (x.profile !== currentPersona?.identifier) friends.push({ persona: x.profile })
                }
            }
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
            return { friends: uniqBy(profiles, ({ id }) => id), nextPageOffset }
        },
        getNextPageParam: ({ nextPageOffset }) => {
            if (nextPageOffset >= records.length) return
            return nextPageOffset
        },
    })
}
