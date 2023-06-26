import { memo } from 'react'
import { useMatch, useNavigate } from 'react-router-dom'
import { PersonaContext } from '@masknet/shared'
import { PopupRoutes } from '@masknet/shared-base'
import { PersonaHeaderUI } from './UI.js'
import { NormalHeader } from '../../../../components/NormalHeader/index.js'
import Services from '../../../../../service.js'

export const PersonaHeader = memo(() => {
    const navigate = useNavigate()
    const matchSelectPersona = useMatch(PopupRoutes.SelectPersona)
    const matchPersona = useMatch(PopupRoutes.Personas)
    const { currentPersona, personas } = PersonaContext.useContainer()

    if (!personas.length) return null

    return (matchPersona || matchSelectPersona) && currentPersona ? (
        <PersonaHeaderUI />
    ) : (
        <NormalHeader onClose={Services.Helper.removePopupWindow} />
    )
})
