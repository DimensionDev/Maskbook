import { memo } from 'react'
import { FriendsDetailUI } from './UI.js'
import { useParams, useLocation } from 'react-router-dom'

export const FriendsDetail = memo(() => {
    const { id } = useParams<{ id: string }>()
    const location = useLocation()
    const { friend } = location.state
    return friend ? <FriendsDetailUI friend={friend} /> : null
})
