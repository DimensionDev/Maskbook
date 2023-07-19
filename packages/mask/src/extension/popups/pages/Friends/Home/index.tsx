import { memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { FriendsHomeUI } from './UI.js'

const FriendsHome = memo(() => {
    const navigate = useNavigate()
    return <FriendsHomeUI />
})

export default FriendsHome
