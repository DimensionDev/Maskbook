import { memo, useContext } from 'react'
import { useUpdateEffect } from '@react-hookz/web'
import { PopupRoutes } from '@masknet/shared-base'
import { PersonaContext } from '@masknet/shared'
import { useLocation, useMatch } from 'react-router-dom'
import { NormalHeader } from '../../../../components/index.js'
import { PageTitleContext } from '../../../../hooks/index.js'
import { PersonaHeaderUI } from './UI.js'

export const PersonaHeader = memo(function PersonaHeader() {
    const location = useLocation()
    const { currentPersona, avatar } = PersonaContext.useContainer()
    const { setExtension } = useContext(PageTitleContext)
    const matchHome = useMatch(PopupRoutes.Personas)
    const matchWalletConnect = useMatch(PopupRoutes.WalletConnect)
    const matchProfilePhoto = useMatch(PopupRoutes.PersonaAvatarSetting)
    const matchSignRequest = useMatch(PopupRoutes.PersonaSignRequest)

    useUpdateEffect(() => {
        setExtension(undefined)
    }, [location.pathname, setExtension])

    if (matchSignRequest && currentPersona)
        return (
            <PersonaHeaderUI
                avatar={avatar}
                fingerprint={currentPersona.identifier.rawPublicKey}
                nickname={currentPersona.nickname}
                publicHexString={currentPersona.identifier.publicKeyAsHex}
            />
        )
    if (matchHome || matchWalletConnect || matchProfilePhoto) return null

    return <NormalHeader />
})
PersonaHeader.displayName = 'PersonaHeader'
