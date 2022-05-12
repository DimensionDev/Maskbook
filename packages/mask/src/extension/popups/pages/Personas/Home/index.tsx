import { memo, useCallback } from 'react'
import { PersonaContext } from '../hooks/usePersonaContext'
import { useNavigate } from 'react-router-dom'
import { PersonaHomeUI } from './UI'
import type { ECKeyIdentifier } from '@masknet/shared-base'
import Services from '../../../../service'

const PersonaHome = memo(() => {
    const { currentPersona, setDeletingPersona, personas } = PersonaContext.useContainer()
    const navigate = useNavigate()

    const onChangeCurrentPersona = useCallback(
        (identifier: ECKeyIdentifier) => Services.Settings.setCurrentPersonaIdentifier(identifier),
        [],
    )

    return (
        <PersonaHomeUI
            currentPersona={currentPersona}
            navigate={navigate}
            personas={personas}
            onDeletePersona={setDeletingPersona}
            onChangeCurrentPersona={onChangeCurrentPersona}
        />
    )
})

export default PersonaHome
