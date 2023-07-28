import { memo, useCallback, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { PersonaContext } from '@masknet/shared'
import {
    DashboardRoutes,
    EMPTY_LIST,
    PopupRoutes,
    type EnhanceableSite,
    type ProfileAccount,
} from '@masknet/shared-base'
import { PersonaHomeUI } from './UI.js'
import Services from '../../../../service.js'
import { HydrateFinished } from '../../../../../utils/createNormalReactRoot.js'
import { useSupportSocialNetworks } from '../../../hook/useSupportSocialNetworks.js'
import { useVerifiedWallets } from '../../../hook/useVerifiedWallets.js'

const PersonaHome = memo(() => {
    const navigate = useNavigate()
    const { avatar, currentPersona, setSelectedAccount, personas, accounts, proofs } = PersonaContext.useContainer()

    useContext(HydrateFinished)()

    const { value: definedSocialNetworks = EMPTY_LIST } = useSupportSocialNetworks()

    const { data: bindingWallets } = useVerifiedWallets(proofs)

    const onCreatePersona = useCallback(() => {
        browser.tabs.create({
            active: true,
            url: browser.runtime.getURL(`/dashboard.html#${DashboardRoutes.SignUpPersona}`),
        })
        if (navigator.userAgent.includes('Firefox')) {
            window.close()
        }
        Services.Helper.removePopupWindow()
    }, [])

    const onRestore = useCallback(() => {
        browser.tabs.create({
            active: true,
            url: browser.runtime.getURL(`/dashboard.html#${DashboardRoutes.RecoveryPersona}`),
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

    const handleAccountClick = useCallback((account: ProfileAccount) => {
        setSelectedAccount(account)
        navigate(PopupRoutes.AccountDetail)
    }, [])

    return (
        <PersonaHomeUI
            hasProofs={!!proofs?.length}
            bindingWallets={bindingWallets}
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
