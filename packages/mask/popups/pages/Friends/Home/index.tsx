import { useLingui } from '@lingui/react/macro'
import { EMPTY_LIST } from '@masknet/shared-base'
import Fuse from 'fuse.js'
import { memo, useMemo, useState } from 'react'
import { useFriendFromList, useFriendsPaged, useTitle } from '../../../hooks/index.js'
import { FriendsHomeUI } from './UI.js'

export const Component = memo(function FriendsHome() {
    const { t } = useLingui()
    useTitle(t`Contacts`)

    const [{ isPending, refetch, records }, , { data, fetchNextPage }] = useFriendsPaged()
    const [searchValue, setSearchValue] = useState('')
    const keyword = useMemo(() => searchValue.trim().replace(/^@/u, '').toLowerCase(), [searchValue])
    const fuse = useMemo(
        () =>
            new Fuse(records, {
                keys: ['profile.userId'],
                isCaseSensitive: false,
                ignoreLocation: true,
                threshold: 0,
            }),
        [records],
    )
    const searchedRecords = useMemo(() => {
        if (!keyword) return EMPTY_LIST
        return fuse.search(keyword).map((item) => item.item)
    }, [fuse, keyword])
    const { isPending: isSearchRecordLoading, data: searchResult = EMPTY_LIST } = useFriendFromList(searchedRecords)

    return (
        <FriendsHomeUI
            friends={data?.pages ?? EMPTY_LIST}
            loading={isPending || (!!keyword && isSearchRecordLoading)}
            setSearchValue={setSearchValue}
            searchValue={keyword}
            searchResult={searchResult}
            fetchNextPage={fetchNextPage}
            fetchNextSearchPage={() => {}}
            refetch={refetch}
        />
    )
})
