import { memo, useState, useMemo } from 'react'
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
    useTitle(t('popups_encrypted_friends'))

    const { data, fetchNextPage, isLoading, profilesArray } = useFriendsPaged()
    const friends = useMemo(() => (data ? data.pages.flatMap((x) => x.friends) : EMPTY_LIST), [data])
    const profiles = useMemo(() => (profilesArray ? profilesArray.pages.flat(1) : EMPTY_LIST), [profilesArray])
    const [searchValue, setSearchValue] = useState('')
    const type = resolveNextIDPlatform(searchValue)
    const { loading: resolveLoading, value: keyword = '' } = useSearchValue(searchValue, type)
    const { loading: searchLoading, value: searchResult } = usePersonasFromNextID(
        keyword,
        type ?? NextIDPlatform.NextID,
        false,
    )
    const { value: searchedList = EMPTY_LIST } = useFriendsFromSearch(searchResult, friends, keyword)

    return (
        <FriendsHomeUI
            friends={friends}
            loading={isLoading || resolveLoading || searchLoading}
            setSearchValue={setSearchValue}
            searchValue={searchValue}
            searchResult={searchedList}
            fetchNextPage={fetchNextPage}
            profiles={profiles}
        />
    )
})

export default FriendsHome
