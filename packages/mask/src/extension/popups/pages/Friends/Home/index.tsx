import { memo, useState, useRef } from 'react'
import { FriendsHomeUI } from './UI.js'
import { useFriends } from '../../../hook/useFriends.js'
import { EMPTY_LIST, NextIDPlatform } from '@masknet/shared-base'
import { useTitle } from '../../../hook/useTitle.js'
import { useI18N } from '../../../../../utils/i18n-next-ui.js'
import { resolveNextIDPlatform, usePersonasFromNextID } from '@masknet/shared'
import { useSearchValue } from '../../../hook/useSearchValue.js'
import { useFriendsFromSearch } from '../../../hook/useFriendsFromSearch.js'
import { useLoadMore } from '../../../hook/useLoadMore.js'

const FriendsHome = memo(function FriendsHome() {
    const { t } = useI18N()
    const { loading, value = EMPTY_LIST } = useFriends()
    const listRef = useRef<HTMLElement>(null)
    const loadMore = useLoadMore(listRef)
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

    return (
        <FriendsHomeUI
            listRef={listRef}
            friends={value}
            loading={loading || resolveLoading || searchLoading}
            setSearchValue={setSearchValue}
            searchValue={searchValue}
            searchResult={searchedList}
        />
    )
})

export default FriendsHome
