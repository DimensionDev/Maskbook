import { memo, useCallback, useMemo } from 'react'
import { PersonaHomeUI } from './UI'
import { PersonaContext } from '../hooks/usePersonaContext'
import { NextIDPlatform, PopupRoutes } from '@masknet/shared-base'
import { useNavigate } from 'react-router-dom'

const PersonaHome = memo(() => {
    const { avatar, currentPersona, proofs, setSelectedPersona } = PersonaContext.useContainer()
    const navigate = useNavigate()

    const wallets = useMemo(() => {
        if (!proofs) return []
        return proofs.filter(({ platform }) => platform === NextIDPlatform.Ethereum)
    }, [proofs])

    const onEdit = useCallback(() => {
        setSelectedPersona(currentPersona)
        navigate(PopupRoutes.PersonaRename)
    }, [currentPersona])

    const onEnterAccounts = useCallback(() => {
        navigate(PopupRoutes.SocialAccounts)
    }, [])

    const onEnterWallets = useCallback(() => {
        if (!proofs) return
        navigate(PopupRoutes.ConnectedWallets)
    }, [proofs])

    return (
        <PersonaHomeUI
            avatar={avatar}
            fingerprint={currentPersona?.identifier.compressedPoint}
            nickname={currentPersona?.nickname}
            accountsCount={currentPersona?.linkedProfiles.length ?? 0}
            walletsCount={wallets.length}
            onEdit={onEdit}
            onEnterAccounts={onEnterAccounts}
            onEnterWallets={onEnterWallets}
        />
    )
})

export default PersonaHome
