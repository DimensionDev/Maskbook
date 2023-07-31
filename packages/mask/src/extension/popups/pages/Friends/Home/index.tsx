import { memo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FriendsHomeUI } from './UI.js'
import { useFriends } from '../../../hook/useFriends.js'
import { EMPTY_LIST, NextIDPlatform, type NextIDPersonaBindings } from '@masknet/shared-base'
import { useTitle } from '../../../hook/useTitle.js'
import { useI18N } from '../../../../../utils/i18n-next-ui.js'
import { resolveNextIDPlatform, resolveValueToSearch, usePersonasFromNextID } from '@masknet/shared'

const FriendsHome = memo(() => {
    const navigate = useNavigate()
    const { t } = useI18N()
    const { value = EMPTY_LIST } = useFriends('twitter.com')
    const [searchValue, setSearchValue] = useState('')
    const type = resolveNextIDPlatform(searchValue)
    const _value = resolveValueToSearch(searchValue)
    const { loading, value: searchResult } = usePersonasFromNextID(_value, type ?? NextIDPlatform.NextID, false)
    console.log(searchResult, _value, 'aaa')
    useTitle(t('popups_encrypted_friends'))
    return (
        <FriendsHomeUI
            friends={value}
            loading={loading}
            setSearchValue={setSearchValue}
            searchValue={searchValue}
            searchResult={searchResult as NextIDPersonaBindings[]}
        />
    )
})

export default FriendsHome
