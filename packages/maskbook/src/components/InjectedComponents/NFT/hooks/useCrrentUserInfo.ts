import type { ProfileIdentifier } from '@masknet/shared-base'
import { useMyPersonas } from '../../../DataSource/useMyPersonas'
import { getProfileIdentitierFromPersona } from '../utils/getProfileIdentitierFromPersona'

export function useCurrentProfileIdentifier(): { userId?: string; identifier?: ProfileIdentifier } | undefined {
    const personas = useMyPersonas()
    if (personas.length === 0) return undefined
    const userInfo = personas
        .map((persona) => {
            return getProfileIdentitierFromPersona(persona)
        })
        .filter((x) => x)

    return userInfo?.[0]
}
