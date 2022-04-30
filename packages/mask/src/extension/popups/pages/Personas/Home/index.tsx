import { memo, useCallback, useMemo } from 'react'
import { PersonaHomeUI } from './UI'
import { PersonaContext } from '../hooks/usePersonaContext'
import { DashboardRoutes, NextIDPlatform } from '@masknet/shared-base'
import { useTitle } from '../../../hook/useTitle'

const PersonaHome = memo(() => {
    const { avatar, currentPersona, proofs, setSelectedPersona, fetchProofsLoading, personas } =
        PersonaContext.useContainer()

    const wallets = useMemo(() => {
        if (!proofs) return []
        return proofs.filter(({ platform }) => platform === NextIDPlatform.Ethereum)
    }, [proofs])

    const onEdit = useCallback(() => {
        setSelectedPersona(currentPersona)
    }, [currentPersona])

    const onCreatePersona = useCallback(() => {
        browser.tabs.create({
            active: true,
            url: browser.runtime.getURL(`/dashboard.html#${DashboardRoutes.SignUp}`),
        })
    }, [])

    const onRestore = useCallback(() => {
        browser.tabs.create({
            active: true,
            url: browser.runtime.getURL(`/dashboard.html#${DashboardRoutes.SignIn}`),
        })
    }, [])

    useTitle('')

    return (
        <PersonaHomeUI
            isEmpty={!personas?.length}
            avatar={avatar}
            fingerprint={currentPersona?.identifier.rawPublicKey}
            nickname={currentPersona?.nickname}
            accountsCount={currentPersona?.linkedProfiles.length ?? 0}
            walletsCount={wallets.length}
            onEdit={onEdit}
            fetchProofsLoading={fetchProofsLoading}
            onCreatePersona={onCreatePersona}
            onRestore={onRestore}
        />
    )
})

export default PersonaHome
