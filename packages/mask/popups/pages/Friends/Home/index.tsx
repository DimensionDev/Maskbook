import { memo, useState, useMemo } from 'react'
import { EMPTY_LIST, NextIDPlatform } from '@masknet/shared-base'
import { resolveNextIDPlatform } from '@masknet/shared'
import { useInfiniteQuery } from '@tanstack/react-query'
import { NextIDProof, Fuse } from '@masknet/web3-providers'
import { FriendsHomeUI } from './UI.js'
import {
    useFriendsPaged,
    useTitle,
    useSearchValue,
    useFriendsFromSearch,
    useFriendFromList,
} from '../../../hooks/index.js'
import { useMaskSharedTrans } from '../../../../shared-ui/index.js'

const FriendsHome = memo(function FriendsHome() {
    const t = useMaskSharedTrans()
    useTitle(t.popups_encrypted_friends())

    const [{ isLoading, refetch, records }, { status: fetchRelationStatus }, { data, status, fetchNextPage }] =
        useFriendsPaged()
    const friends = useMemo(() => data?.pages.flatMap((x) => x.friends) ?? EMPTY_LIST, [data])
    const [searchValue, setSearchValue] = useState('')
    const type = resolveNextIDPlatform(searchValue)
    const { loading: resolveLoading, value: keyword = '' } = useSearchValue(searchValue, type)
    const fuse = useMemo(() => {
        return Fuse.create(records, {
            keys: ['profile.userId'],
            isCaseSensitive: false,
            ignoreLocation: true,
            threshold: 0,
        })
    }, [records])
    const searchedRecords = useMemo(() => {
        if (!keyword || type !== NextIDPlatform.Twitter) return EMPTY_LIST
        return fuse.search(keyword).map((item) => item.item)
    }, [fuse, keyword, type])
    const { isLoading: isSearchRecordLoading, data: localSearchedList = EMPTY_LIST } =
        useFriendFromList(searchedRecords)
    const {
        isLoading: searchLoading,
        isInitialLoading,
        data: searchResultArray,
        fetchNextPage: fetchNextSearchPage,
    } = useInfiniteQuery({
        queryKey: ['search-personas', keyword, type],
        initialPageParam: undefined as any,
        queryFn: async ({ pageParam }) => {
            if (!type) return EMPTY_LIST
            return await NextIDProof.queryExistedBindingByPlatform(type, keyword, pageParam ?? 1, false)
        },
        enabled: !!keyword && !!type,
        getNextPageParam: (lastPage, allPages) => {
            if (lastPage.length === 0) return undefined
            return allPages.length + 1
        },
    })
    const searchResult = useMemo(() => searchResultArray?.pages.flat() ?? EMPTY_LIST, [searchResultArray])
    const searchedList = useFriendsFromSearch(localSearchedList, searchResult, friends, keyword)
    return (
        <FriendsHomeUI
            friends={data?.pages ?? EMPTY_LIST}
            loading={
                isLoading ||
                resolveLoading ||
                (!!keyword && !!type ? searchLoading || isSearchRecordLoading : isInitialLoading) ||
                status === 'pending' ||
                fetchRelationStatus === 'pending'
            }
            setSearchValue={setSearchValue}
            searchValue={searchValue}
            searchResult={searchedList}
            fetchNextPage={fetchNextPage}
            fetchNextSearchPage={fetchNextSearchPage}
            refetch={refetch}
        />
    )
})

export default FriendsHome
