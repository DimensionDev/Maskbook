import { isProfileIdentifier } from '@masknet/shared'
import { EMPTY_LIST, type BindingProof, type ECKeyIdentifier, type ProfileIdentifier } from '@masknet/shared-base'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { first } from 'lodash-es'
import { useCallback } from 'react'
import { useCurrentPersona } from '../../../components/DataSource/useCurrentPersona.js'
import Services from '#services'
import { type RelationRecord } from '../../../../background/database/persona/type.js'

export type FriendsInformation = Friend & {
    profiles: BindingProof[]
    id: string
}

export type Friend = {
    persona: ECKeyIdentifier
    profile?: ProfileIdentifier
    avatar?: string
}

function isFriend(obj: any): obj is Friend {
    return typeof obj === 'object' && 'persona' in obj
}

export function useFriendsPaged() {
    const currentPersona = useCurrentPersona()

    const {
        data: records = EMPTY_LIST,
        isLoading: recordsLoading,
        refetch: refetchRecords,
        status: fetchRelationStatus,
    } = useQuery(
        ['relation-records', currentPersona?.identifier.rawPublicKey],
        async () => {
            return Services.Identity.queryRelationPaged(
                currentPersona?.identifier,
                {
                    network: 'all',
                    pageOffset: 0,
                },
                3000,
            )
        },
        {
            enabled: !!currentPersona,
        },
    )
    const {
        data,
        hasNextPage,
        fetchNextPage,
        isLoading,
        isFetchingNextPage,
        refetch: refetchFriends,
        status,
    } = useInfiniteQuery({
        queryKey: ['friends', currentPersona?.identifier.rawPublicKey],
        enabled: !recordsLoading,
        queryFn: async ({ pageParam = 0 }) => {
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
            return { friends, nextPageOffset }
        },
        getNextPageParam: ({ nextPageOffset }) => {
            if (nextPageOffset >= records.length - 1) return
            return nextPageOffset
        },
    })
    const refetch = useCallback(() => {
        refetchFriends()
        refetchRecords()
    }, [refetchFriends, refetchRecords])

    return {
        data,
        isLoading: isLoading || recordsLoading,
        hasNextPage,
        fetchNextPage,
        isFetchingNextPage,
        refetch,
        status,
        fetchRelationStatus,
        records,
    }
}

export function useFriendFromList(searchedRecords: RelationRecord[]) {
    const currentPersona = useCurrentPersona()
    return useQuery(['search-local', searchedRecords], async () => {
        const friends: Friend[] = (
            await Promise.all(
                searchedRecords.map(async (x) => {
                    if (isProfileIdentifier(x.profile)) {
                        const res = first(await Services.Identity.queryProfilesInformation([x.profile]))
                        if (res?.linkedPersona !== undefined && res?.linkedPersona !== currentPersona?.identifier)
                            return {
                                persona: res.linkedPersona,
                                profile: x.profile,
                                avatar: res.avatar,
                            }
                        return {}
                    } else {
                        if (x.profile !== currentPersona?.identifier) return { persona: x.profile }
                        return {}
                    }
                }),
            )
        ).filter(isFriend) as Friend[]
        return friends
    })
}
