import { useCallback } from 'react'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { isProfileIdentifier } from '@masknet/shared'
import { EMPTY_LIST, type ECKeyIdentifier, type ProfileIdentifier } from '@masknet/shared-base'
import Services from '#services'
import { useCurrentPersona } from '../../shared-ui/hooks/index.js'
import type { RelationRecord } from '../../background/database/persona/type.js'
import { first } from 'lodash-es'

export interface Friend {
    persona: ECKeyIdentifier
    profile?: ProfileIdentifier
    avatar?: string
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
            networkMode: 'always',
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
                    const profile = first(await Services.Identity.queryProfileInformation(x.profile))
                    if (profile?.linkedPersona && profile.linkedPersona !== currentPersona?.identifier)
                        friends.push({
                            persona: profile.linkedPersona,
                            profile: x.profile,
                            avatar: profile.avatar,
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
        return (
            await Promise.all(
                searchedRecords.map<Promise<Friend | undefined>>(async (x) => {
                    if (!isProfileIdentifier(x.profile)) return
                    const profile = first(await Services.Identity.queryProfileInformation(x.profile))
                    if (
                        profile?.linkedPersona !== undefined &&
                        profile?.linkedPersona.publicKeyAsHex !== currentPersona?.identifier.publicKeyAsHex
                    )
                        return {
                            persona: profile.linkedPersona,
                            profile: x.profile,
                            avatar: profile.avatar,
                        }
                    return
                }),
            )
        ).filter((x): x is Friend => typeof x !== 'undefined' && Object.hasOwn(x, 'persona'))
    })
}
