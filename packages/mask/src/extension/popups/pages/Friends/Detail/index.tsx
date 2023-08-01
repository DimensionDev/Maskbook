import { memo } from 'react'
import { FriendsDetailUI } from './UI.js'
import { useParams, useLocation } from 'react-router-dom'

export const FriendsDetail = memo(() => {
    const { id } = useParams<{ id: string }>()
    const location = useLocation()
    const { avatar, profiles, nextId, publicKey } = location.state

    return <FriendsDetailUI avatar={avatar} profiles={profiles} nextId={nextId} publicKey={publicKey} />
})
