import { memo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FriendsHomeUI } from './UI.js'
import { useFriends } from '../../../hook/useFriends.js'
import { EMPTY_LIST } from '@masknet/shared-base'
import { useTitle } from '../../../hook/useTitle.js'
import { useI18N } from '../../../../../utils/i18n-next-ui.js'

const FriendsHome = memo(() => {
    const navigate = useNavigate()
    const { t } = useI18N()
    const { value = EMPTY_LIST } = useFriends('twitter.com')
    const [searching, setSearching] = useState(false)
    const [searchResult, setSearchResult] = useState([])
    useTitle(t('popups_encrypted_friends'))
    return <FriendsHomeUI friends={value} />
})

export default FriendsHome
