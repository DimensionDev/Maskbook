import { memo, useCallback, useContext, useMemo } from 'react'
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
import { useTheme } from '@mui/material'

const PersonaHome = memo(() => {
    const theme = useTheme()
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

    const personaAvatar = useMemo(() => {
        if (avatar) return avatar
        if (proofs?.length) {
            return theme.palette.mode === 'dark'
                ? new URL('../../../assets/NextId.dark.png', import.meta.url).toString()
                : new URL('../../../assets/NextId.light.png', import.meta.url).toString()
        }

        return
    }, [theme.palette.mode, avatar, proofs])

    return (
        <PersonaHomeUI
            bindingWallets={bindingWallets}
            accounts={accounts}
            networks={definedSocialNetworks}
            isEmpty={!personas?.length}
            avatar={personaAvatar}
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
