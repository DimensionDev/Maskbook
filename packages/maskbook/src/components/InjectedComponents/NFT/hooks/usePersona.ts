import type { Persona } from '../../../../database'
import { useMyPersonas } from '../../../DataSource/useMyPersonas'
import { getProfileIdentifierFromPersona } from '../utils/getProfileIdentifierFromPersona'

export function usePersona(userId: string) {
    const personas = useMyPersonas()
    const userInfo = personas
        .map((persona: Persona) => {
            const identitier = getProfileIdentifierFromPersona(persona)
            if (identitier?.userId === userId) return persona
            return
        })
        .filter((x: any) => x)

    return userInfo?.[0]
}
