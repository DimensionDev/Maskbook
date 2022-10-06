import type { IdentityResolved } from '@masknet/plugin-infra/content-script'
import { usePersonasFromNextID } from './usePersonasFromNextID.js'
import { usePersonaFromDB } from './usePersonaFromDB.js'

export function usePersonaFromNextID(identityResolved: IdentityResolved | undefined) {
    const { value: persona } = usePersonaFromDB(identityResolved)
    const { value: personas, ...rest } = usePersonasFromNextID(identityResolved)

    return {
        ...rest,
        value: personas?.find((x) => x.persona.toLowerCase() === persona?.identifier.publicKeyAsHex.toLowerCase()),
    }
}
