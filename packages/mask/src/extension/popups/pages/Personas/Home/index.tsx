import { memo } from 'react'
import { PersonaHomeUI } from './UI'
import { PersonaContext } from '../hooks/usePersonaContext'
import { PersonaHeader } from '../../../components/Header'

const PersonaHome = memo(() => {
    const { currentPersona, avatar } = PersonaContext.useContainer()

    return (
        <>
            {currentPersona ? (
                <PersonaHeader
                    currentIdentifier={currentPersona.identifier.toText()}
                    nickname={currentPersona.nickname}
                    avatar={avatar}
                />
            ) : null}
            <PersonaHomeUI />
        </>
    )
})

export default PersonaHome
