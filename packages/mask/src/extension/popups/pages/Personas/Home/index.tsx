import { memo, useCallback, useMemo } from 'react'
import { PersonaHomeUI } from './UI'
import { PersonaContext } from '../hooks/usePersonaContext'
import { NextIDPlatform } from '@masknet/shared-base'

const PersonaHome = memo(() => {
    const { avatar, currentPersona, proofs, setSelectedPersona, fetchProofsLoading } = PersonaContext.useContainer()

    const wallets = useMemo(() => {
        if (!proofs) return []
        return proofs.filter(({ platform }) => platform === NextIDPlatform.Ethereum)
    }, [proofs])

    const onEdit = useCallback(() => {
        setSelectedPersona(currentPersona)
    }, [currentPersona])

    return (
        <PersonaHomeUI
            avatar={avatar}
            fingerprint={currentPersona?.identifier.compressedPoint}
            nickname={currentPersona?.nickname}
            accountsCount={currentPersona?.linkedProfiles.length ?? 0}
            walletsCount={wallets.length}
            onEdit={onEdit}
            fetchProofsLoading={fetchProofsLoading}
        />
    )
})

export default PersonaHome
