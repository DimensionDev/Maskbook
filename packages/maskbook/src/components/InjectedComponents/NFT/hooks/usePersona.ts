import type { Persona } from '../../../../database'
import { useMyPersonas } from '../../../DataSource/useMyPersonas'
import { getProfileIdentitierFromPersona } from '../utils/getProfileIdentitierFromPersona'

export function usePersona(userId: string) {
    const personas = useMyPersonas()
    const userInfo = personas
        .map((persona: Persona) => {
            const identitier = getProfileIdentitierFromPersona(persona)
            if (identitier?.userId === userId) return persona
            return
        })
        .filter((x) => x)

    return userInfo?.[0]
}
