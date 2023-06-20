import { memo } from 'react'
import { useMatch, useNavigate } from 'react-router-dom'
import { PopupRoutes } from '@masknet/shared-base'
import { PersonaHeaderUI } from './UI.js'
import { NormalHeader } from '../../../../components/NormalHeader/index.js'
import Services from '../../../../../service.js'
import { PersonaContext } from '@masknet/shared'

export const PersonaHeader = memo(() => {
    const navigate = useNavigate()
    const matchSelectPersona = useMatch(PopupRoutes.SelectPersona)
    const matchPersona = useMatch(PopupRoutes.Personas)
    const { currentPersona, avatar } = PersonaContext.useContainer()

    return (matchPersona || matchSelectPersona) && currentPersona ? (
        <PersonaHeaderUI
            onActionClick={() => navigate(matchSelectPersona ? PopupRoutes.Personas : PopupRoutes.SelectPersona)}
            fingerprint={currentPersona.identifier.rawPublicKey}
            isSelectPersonaPage={!!matchSelectPersona}
            avatar={avatar}
            nickname={currentPersona.nickname}
        />
    ) : (
        <NormalHeader onClose={Services.Helper.removePopupWindow} />
    )
})
