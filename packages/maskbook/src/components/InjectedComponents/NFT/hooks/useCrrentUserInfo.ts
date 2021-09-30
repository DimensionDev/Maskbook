import type { ProfileIdentifier } from '@masknet/shared-base'
import type { Persona } from '../../../../database'
import { useMyPersonas } from '../../../DataSource/useMyPersonas'
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
