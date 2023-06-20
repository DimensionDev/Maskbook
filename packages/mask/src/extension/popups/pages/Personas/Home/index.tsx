import { memo, useCallback, useContext, useMemo } from 'react'
import { PersonaHomeUI } from './UI.js'
import { DashboardRoutes, NextIDPlatform } from '@masknet/shared-base'
import { useTitle } from '../../../hook/useTitle.js'
import Services from '../../../../service.js'
import { HydrateFinished } from '../../../../../utils/createNormalReactRoot.js'
import { PersonaContext } from '@masknet/shared'

const PersonaHome = memo(() => {
    const { avatar, currentPersona, proofs, setSelectedPersona, fetchProofsLoading, personas, accounts } =
        PersonaContext.useContainer()

    useContext(HydrateFinished)()

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
        if (navigator.userAgent.includes('Firefox')) {
            window.close()
        }
        Services.Helper.removePopupWindow()
    }, [])

    const onRestore = useCallback(() => {
        browser.tabs.create({
            active: true,
            url: browser.runtime.getURL(`/dashboard.html#${DashboardRoutes.SignIn}`),
        })
        if (navigator.userAgent.includes('Firefox')) {
            window.close()
        }
        Services.Helper.removePopupWindow()
    }, [])

    useTitle('')

    return (
        <PersonaHomeUI
            isEmpty={!personas?.length}
            avatar={avatar}
            fingerprint={currentPersona?.identifier.rawPublicKey}
            nickname={currentPersona?.nickname}
            accountsCount={accounts.length ?? 0}
            walletsCount={wallets.length}
            onEdit={onEdit}
            fetchProofsLoading={fetchProofsLoading}
            onCreatePersona={onCreatePersona}
            onRestore={onRestore}
        />
    )
})

export default PersonaHome
