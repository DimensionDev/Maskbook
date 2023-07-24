import { memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { FriendsHomeUI } from './UI.js'
import { useFriends } from '../../../hook/useFriends.js'
import { EMPTY_LIST } from '@masknet/shared-base'

const FriendsHome = memo(() => {
    const navigate = useNavigate()
    const { value = EMPTY_LIST } = useFriends('twitter.com')
    console.log(value)
    return <FriendsHomeUI friends={value} />
})

export default FriendsHome
