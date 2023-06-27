import { memo, useCallback, useContext } from 'react'
import { PersonaHomeUI } from './UI.js'
import { DashboardRoutes, EMPTY_LIST, PopupRoutes, type EnhanceableSite } from '@masknet/shared-base'
import Services from '../../../../service.js'
import { HydrateFinished } from '../../../../../utils/createNormalReactRoot.js'
import { PersonaContext, type Account } from '@masknet/shared'
import { useSupportSocialNetworks } from '../../../hook/useSupportSocialNetworks.js'
import { useNavigate } from 'react-router-dom'

const PersonaHome = memo(() => {
    const navigate = useNavigate()

    const { avatar, currentPersona, setSelectedAccount, personas, accounts } = PersonaContext.useContainer()

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

    const handleConnect = useCallback(
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

    const handleAccountClick = useCallback((account: Account) => {
        setSelectedAccount(account)
        navigate(PopupRoutes.AccountDetail)
    }, [])

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
            onConnect={handleConnect}
            onAccountClick={handleAccountClick}
        />
    )
})

export default PersonaHome
