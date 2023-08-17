import { memo, useState, useMemo, useCallback } from 'react'
import { FriendsHomeUI } from './UI.js'
import { useFriendsPaged } from '../../../hook/useFriends.js'
import { EMPTY_LIST, NextIDPlatform } from '@masknet/shared-base'
import { useTitle } from '../../../hook/useTitle.js'
import { useI18N } from '../../../../../utils/i18n-next-ui.js'
import { resolveNextIDPlatform, usePersonasFromNextID } from '@masknet/shared'
import { useSearchValue } from '../../../hook/useSearchValue.js'
import { useFriendsFromSearch } from '../../../hook/useFriendsFromSearch.js'

const FriendsHome = memo(function FriendsHome() {
    const { t } = useI18N()
    const { data, fetchNextPage, isFetchingNextPage, hasNextPage, isLoading } = useFriendsPaged()
    const value = useMemo(() => (data ? data.pages.flatMap((x) => x.friends) : EMPTY_LIST), [data])
    const [searchValue, setSearchValue] = useState('')
    const type = resolveNextIDPlatform(searchValue)
    const { loading: resolveLoading, value: _value = '' } = useSearchValue(searchValue, type)
    const { loading: searchLoading, value: searchResult } = usePersonasFromNextID(
        _value,
        type ?? NextIDPlatform.NextID,
        false,
    )
    const { value: searchedList = EMPTY_LIST } = useFriendsFromSearch(searchResult, value, _value)
    const fetchMore = useCallback(() => {
        hasNextPage ? fetchNextPage() : null
    }, [hasNextPage, fetchNextPage])
    useTitle(t('popups_encrypted_friends'))
    return (
        <FriendsHomeUI
            friends={value}
            loading={isLoading || resolveLoading || searchLoading}
            setSearchValue={setSearchValue}
            searchValue={searchValue}
            searchResult={searchedList}
            fetchNextPage={fetchMore}
        />
    )
})

export default FriendsHome
