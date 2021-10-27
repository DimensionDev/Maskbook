import { useMyPersonas } from '../../../components/DataSource/useMyPersonas'
import type { Persona } from '../../../database'
import type { ProfileIdentifier } from '../../../database/type'
import { getProfileIdentifierFromPersona } from '../utils/getProfileIdentifierFromPersona'

export function useCurrentProfileIdentifiers(): ({ userId?: string; identifier?: ProfileIdentifier } | undefined)[] {
    const personas = useMyPersonas()
    if (personas.length === 0) return []
    return personas
        .map((persona: Persona) => {
            return getProfileIdentifierFromPersona(persona)
        })
        .filter((x: any) => x)
}
