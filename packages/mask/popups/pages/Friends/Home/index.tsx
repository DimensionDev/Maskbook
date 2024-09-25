import { memo, useState, useMemo } from 'react'
import { EMPTY_LIST, NextIDPlatform } from '@masknet/shared-base'
import { resolveNextIDPlatform } from '@masknet/shared'
import { useInfiniteQuery } from '@tanstack/react-query'
import { NextIDProof } from '@masknet/web3-providers'
import { FriendsHomeUI } from './UI.js'
import {
    useFriendsPaged,
    useTitle,
    useSearchValue,
    useFriendsFromSearch,
    useFriendFromList,
} from '../../../hooks/index.js'
import Fuse from 'fuse.js'
import { msg } from '@lingui/macro'
import { useLingui } from '@lingui/react'

export const Component = memo(function FriendsHome() {
    const { _ } = useLingui()
    useTitle(_(msg`Contacts`))

    const [{ isPending, refetch, records }, , { data, fetchNextPage }] = useFriendsPaged()
    const friends = useMemo(() => data?.pages.flatMap((x) => x.friends) ?? EMPTY_LIST, [data])
    const [searchValue, setSearchValue] = useState('')
    const type = resolveNextIDPlatform(searchValue)
    const { loading: resolveLoading, value: keyword = '' } = useSearchValue(searchValue, type)
    const fuse = useMemo(() => {
        return new Fuse(records, {
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
    const { isPending: isSearchRecordLoading, data: localSearchedList = EMPTY_LIST } =
        useFriendFromList(searchedRecords)
    const {
        isPending: searchLoading,
        isLoading,
        data: searchResultArray,
        fetchNextPage: fetchNextSearchPage,
    } = useInfiniteQuery({
        queryKey: ['search-personas', keyword, type],
        initialPageParam: undefined as any,
        queryFn: async ({ pageParam }) => {
            if (!type) return EMPTY_LIST
            return NextIDProof.queryExistedBindingByPlatform(type, keyword, pageParam ?? 1, false)
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
                isPending ||
                resolveLoading ||
                (!!keyword && !!type ? searchLoading || isSearchRecordLoading : isLoading)
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
