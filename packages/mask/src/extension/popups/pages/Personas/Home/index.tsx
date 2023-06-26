import { memo, useCallback, useContext } from 'react'
import { PersonaHomeUI } from './UI.js'
import { DashboardRoutes, EMPTY_LIST, type EnhanceableSite } from '@masknet/shared-base'
import { useTitle } from '../../../hook/useTitle.js'
import Services from '../../../../service.js'
import { HydrateFinished } from '../../../../../utils/createNormalReactRoot.js'
import { PersonaContext } from '@masknet/shared'
import { useSupportSocialNetworks } from '../../../hook/useSupportSocialNetworks.js'

const PersonaHome = memo(() => {
    const { avatar, currentPersona, proofs, setSelectedPersona, fetchProofsLoading, personas, accounts } =
        PersonaContext.useContainer()

    useContext(HydrateFinished)()

    const { value: definedSocialNetworks = EMPTY_LIST } = useSupportSocialNetworks()

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

    const onConnect = useCallback(
        async (networkIdentifier: EnhanceableSite) => {
            if (currentPersona) {
                await Services.SocialNetwork.connectSite(
                    currentPersona.identifier,
                    networkIdentifier,
                    'local',
                    undefined,
                    false,
                )
            }
        },
        [currentPersona],
    )

    useTitle('')

    return (
        <PersonaHomeUI
            accounts={accounts}
            networks={definedSocialNetworks}
            isEmpty={!personas?.length}
            avatar={avatar}
            fingerprint={currentPersona?.identifier.rawPublicKey}
            publicKey={currentPersona?.identifier.publicKeyAsHex}
            nickname={currentPersona?.nickname}
            onCreatePersona={onCreatePersona}
            onRestore={onRestore}
            onConnect={onConnect}
        />
    )
})

export default PersonaHome
