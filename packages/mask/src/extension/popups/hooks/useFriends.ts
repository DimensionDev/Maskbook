import { isProfileIdentifier } from '@masknet/shared'
import { EMPTY_LIST, type BindingProof, type ECKeyIdentifier, type ProfileIdentifier } from '@masknet/shared-base'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { first } from 'lodash-es'
import { useCallback } from 'react'
import { useCurrentPersona } from '../../../components/DataSource/useCurrentPersona.js'
import Services from '../../../extension/service.js'

export type FriendsInformation = Friend & {
    profiles: BindingProof[]
    id: string
}

export type Friend = {
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
    } = useQuery(['relation-records', currentPersona?.identifier.rawPublicKey], async () => {
        return Services.Identity.queryRelationPaged(
            currentPersona?.identifier,
            {
                network: 'all',
                pageOffset: 0,
            },
            3000,
        )
    })
    const {
        data,
        hasNextPage,
        fetchNextPage,
        isLoading,
        isFetchingNextPage,
        refetch: refetchFriends,
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
    }
}
