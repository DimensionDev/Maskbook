import { memo, useCallback, useMemo, useState } from 'react'
import { FriendsDetailUI } from './UI.js'
import { useLocation } from 'react-router-dom'
import Services from '../../../../service.js'
import { ECKeyIdentifier } from '@masknet/shared-base'
export const FriendsDetail = memo(() => {
    const location = useLocation()
    const { avatar, profiles, nextId, publicKey, isLocal } = location.state
    const [deleted, setDeleted] = useState(false)
    const handleDelete = useCallback(async () => {
        const personaIdentifier = ECKeyIdentifier.fromHexPublicKeyK256(nextId).expect(
            `${nextId} should be a valid hex public key in k256`,
        )
        await Services.Identity.deletePersona(personaIdentifier, 'safe delete')
        setDeleted(true)
    }, [nextId])
    const local = useMemo(() => isLocal && !deleted, [isLocal, deleted])

    return (
        <FriendsDetailUI
            avatar={avatar}
            profiles={profiles}
            nextId={nextId}
            publicKey={publicKey}
            isLocal={local}
            handleDelete={handleDelete}
        />
    )
})
