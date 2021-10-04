import { useMyPersonas } from '../../../components/DataSource/useMyPersonas'
import type { Persona } from '../../../database'
import type { ProfileIdentifier } from '../../../database/type'
import { getProfileIdentifierFromPersona } from '../utils/getProfileIdentifierFromPersona'

export function useCurrentProfileIdentifier(): { userId?: string; identifier?: ProfileIdentifier } | undefined {
    const personas = useMyPersonas()
    if (personas.length === 0) return
    const userInfo = personas
        .map((persona: Persona) => {
            return getProfileIdentifierFromPersona(persona)
        })
        .filter((x: any) => x)

    return userInfo?.[0]
}
