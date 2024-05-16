import { memo, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { PersonaContext } from '@masknet/shared'
import {
    DashboardRoutes,
    EMPTY_LIST,
    PopupRoutes,
    type EnhanceableSite,
    type ProfileAccount,
    NextIDPlatform,
} from '@masknet/shared-base'
import { PersonaHomeUI } from './UI.js'
import Services from '#services'
import { useSupportSocialNetworks, useHasPassword } from '../../../hooks/index.js'
import { requestPermissionFromExtensionPage } from '../../../../shared-ui/index.js'

export const Component = memo(function PersonaHome() {
    const navigate = useNavigate()
    const { avatar, currentPersona, setSelectedAccount, personas, accounts, proofs } = PersonaContext.useContainer()

    const { data: definedSocialNetworks = EMPTY_LIST } = useSupportSocialNetworks()
    const bindingWallets = useMemo(() => proofs?.filter((x) => x.platform === NextIDPlatform.Ethereum), [proofs])
    const { hasPassword } = useHasPassword()

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
            if (!currentPersona) return
            if (!(await requestPermissionFromExtensionPage(networkIdentifier))) return
            await Services.SiteAdaptor.connectSite(currentPersona.identifier, networkIdentifier, undefined, true)
        },
        [currentPersona],
    )

    const handleAccountClick = useCallback((account: ProfileAccount) => {
        setSelectedAccount(account)
        navigate(PopupRoutes.AccountDetail)
    }, [])

    return (
        <PersonaHomeUI
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
            hasPaymentPassword={hasPassword}
        />
    )
})
