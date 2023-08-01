import { memo } from 'react'
import { FriendsDetailUI } from './UI.js'
import { useParams, useLocation } from 'react-router-dom'
import { PersonaContext } from '@masknet/shared'
export const FriendsDetail = memo(() => {
    const { id } = useParams<{ id: string }>()
    const location = useLocation()
    const { avatar, profiles, nextId, publicKey, isLocal } = location.state
    const { currentPersona } = PersonaContext.useContainer()

    return (
        <FriendsDetailUI avatar={avatar} profiles={profiles} nextId={nextId} publicKey={publicKey} isLocal={isLocal} />
    )
})
