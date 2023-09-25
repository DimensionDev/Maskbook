import { memo, useState, useMemo } from 'react'
import { FriendsHomeUI } from './UI.js'
import { useFriendsPaged, useTitle, useSearchValue, useFriendsFromSearch } from '../../../hooks/index.js'
import { EMPTY_LIST } from '@masknet/shared-base'
import { useMaskSharedTrans } from '../../../../../utils/i18n-next-ui.js'
import { resolveNextIDPlatform } from '@masknet/shared'
import { useInfiniteQuery } from '@tanstack/react-query'
import { NextIDProof } from '@masknet/web3-providers'

const FriendsHome = memo(function FriendsHome() {
    const { t } = useMaskSharedTrans()
    useTitle(t('popups_encrypted_friends'))

    const { data, fetchNextPage, isLoading, refetch } = useFriendsPaged()
    const friends = useMemo(() => data?.pages.flatMap((x) => x.friends) ?? EMPTY_LIST, [data])
    const [searchValue, setSearchValue] = useState('')
    const type = resolveNextIDPlatform(searchValue)
    const { loading: resolveLoading, value: keyword = '' } = useSearchValue(searchValue, type)
    const {
        isLoading: searchLoading,
        data: searchResultArray,
        fetchNextPage: fetchNextSearchPage,
    } = useInfiniteQuery(
        ['search-personas', keyword, type],
        async ({ pageParam }) => {
            if (!type) return EMPTY_LIST
            return await NextIDProof.queryExistedBindingByPlatform(type, keyword, pageParam ?? 1, false)
        },
        {
            enabled: !!keyword && !!type,
            getNextPageParam: (lastPage, allPages) => {
                if (lastPage.length === 0) return undefined
                return allPages.length + 1
            },
        },
    )
    const searchResult = useMemo(() => searchResultArray?.pages.flat() ?? EMPTY_LIST, [searchResultArray])
    const searchedList = useFriendsFromSearch(searchResult, friends, keyword)

    return (
        <FriendsHomeUI
            friends={data?.pages ?? EMPTY_LIST}
            loading={isLoading || resolveLoading || searchLoading}
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
