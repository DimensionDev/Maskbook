import { memo, useState, useRef, useMemo, useEffect } from 'react'
import { FriendsHomeUI } from './UI.js'
import { useFriendsPaged } from '../../../hook/useFriends.js'
import { EMPTY_LIST, NextIDPlatform } from '@masknet/shared-base'
import { useTitle } from '../../../hook/useTitle.js'
import { useI18N } from '../../../../../utils/i18n-next-ui.js'
import { resolveNextIDPlatform, usePersonasFromNextID } from '@masknet/shared'
import { useSearchValue } from '../../../hook/useSearchValue.js'
import { useFriendsFromSearch } from '../../../hook/useFriendsFromSearch.js'
import { useLoadMore } from '../../../hook/useLoadMore.js'

const FriendsHome = memo(function FriendsHome() {
    const { t } = useI18N()
    const listRef = useRef<HTMLElement>(null)
    const isAtBottom = useLoadMore(listRef)
    const { data, fetchNextPage, hasNextPage, isLoading } = useFriendsPaged()
    const value = useMemo(() => (data ? data.pages.flat() : EMPTY_LIST), [data])
    const [searchValue, setSearchValue] = useState('')
    const type = resolveNextIDPlatform(searchValue)
    const { loading: resolveLoading, value: _value = '' } = useSearchValue(searchValue, type)
    const { loading: searchLoading, value: searchResult } = usePersonasFromNextID(
        _value,
        type ?? NextIDPlatform.NextID,
        false,
    )
    const { value: searchedList = EMPTY_LIST } = useFriendsFromSearch(searchResult, value, _value)
    useTitle(t('popups_encrypted_friends'))
    useEffect(() => {
        if (isAtBottom && hasNextPage) fetchNextPage()
    }, [isAtBottom])
    return (
        <FriendsHomeUI
            listRef={listRef}
            friends={value}
            loading={isLoading || resolveLoading || searchLoading}
            setSearchValue={setSearchValue}
            searchValue={searchValue}
            searchResult={searchedList}
        />
    )
})

export default FriendsHome
