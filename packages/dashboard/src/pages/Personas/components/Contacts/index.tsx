import { memo } from 'react'
import { Services } from '../../../../API'
import { useAsync } from 'react-use'
import { PersonaContext } from '../../hooks/usePersonaContext'

export const Contacts = memo(() => {
    const { currentPersona } = PersonaContext.useContainer()
    const { value } = useAsync(async () => {
        return Services.Identity.queryProfiles('twitter.com', currentPersona?.identifier)
    }, [currentPersona])

    return <div>contact</div>
})
