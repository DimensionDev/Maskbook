import { ECKeyIdentifier } from '@masknet/shared-base'
import { queryClient } from '@masknet/shared-base-ui'
import { memo, useCallback, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useCurrentPersona } from '../../../../../components/DataSource/useCurrentPersona.js'
import Services from '../../../../service.js'
import { FriendsDetailUI } from './UI.js'

export const FriendsDetail = memo(function FriendsDetail() {
    const location = useLocation()
    const { avatar, profiles, nextId, publicKey, isLocal } = location.state
    const [deleted, setDeleted] = useState(false)
    const currentPersona = useCurrentPersona()
    const rawPublicKey = currentPersona?.identifier.rawPublicKey
    const handleDelete = useCallback(async () => {
        const personaIdentifier = ECKeyIdentifier.fromHexPublicKeyK256(nextId).expect(
            `${nextId} should be a valid hex public key in k256`,
        )
        if (currentPersona) await Services.Identity.deletePersonaRelation(personaIdentifier, currentPersona?.identifier)
        await Services.Identity.deletePersona(personaIdentifier, 'safe delete')
        setDeleted(true)
        queryClient.invalidateQueries(['relation-records', rawPublicKey])
        queryClient.invalidateQueries(['friends', rawPublicKey])
    }, [nextId, rawPublicKey])

    return (
        <FriendsDetailUI
            avatar={avatar}
            profiles={profiles}
            nextId={nextId}
            publicKey={publicKey}
            isLocal={isLocal ? !deleted : false}
            onDelete={handleDelete}
        />
    )
})
