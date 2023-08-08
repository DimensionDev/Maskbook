import { memo, useState } from 'react'
import { FriendsHomeUI } from './UI.js'
import { useFriends } from '../../../hook/useFriends.js'
import { EMPTY_LIST, NextIDPlatform } from '@masknet/shared-base'
import { useTitle } from '../../../hook/useTitle.js'
import { useI18N } from '../../../../../utils/i18n-next-ui.js'
import { resolveNextIDPlatform, resolveValueToSearch, usePersonasFromNextID } from '@masknet/shared'
import { useFriendsFromSearch } from '../../../hook/useFriendsFromSearch.js'

const FriendsHome = memo(function FriendsHome() {
    const { t } = useI18N()
    const { loading, value = EMPTY_LIST } = useFriends('twitter.com')
    const [searchValue, setSearchValue] = useState('')
    const type = resolveNextIDPlatform(searchValue)
    const _value = resolveValueToSearch(searchValue)
    const { loading: searchLoading, value: searchResult } = usePersonasFromNextID(
        _value,
        type ?? NextIDPlatform.NextID,
        true,
    )
    const { value: searchedList = EMPTY_LIST } = useFriendsFromSearch(searchResult, value)
    useTitle(t('popups_encrypted_friends'))
    return (
        <FriendsHomeUI
            friends={value}
            loading={loading || searchLoading}
            setSearchValue={setSearchValue}
            searchValue={searchValue}
            searchResult={searchedList}
        />
    )
})

export default FriendsHome
