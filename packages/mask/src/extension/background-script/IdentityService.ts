import { personaRecordToPersona, queryPersona as queryPersonaRAW } from '../../database'
import type { PersonaIdentifier } from '@masknet/shared-base'
import type { Persona } from '../../database/Persona/types'
import { queryPersonasDB } from '../../../background/database/persona/db'

import { assertEnvironment, Environment } from '@dimensiondev/holoflows-kit'

assertEnvironment(Environment.ManifestBackground)

export * from '../../../background/services/identity'

/** @deprecated */
export async function queryPersona(
    identifier: PersonaIdentifier,
): Promise<
    Pick<
        Persona,
        | 'publicHexKey'
        | 'identifier'
        | 'hasPrivateKey'
        | 'mnemonic'
        | 'createdAt'
        | 'updatedAt'
        | 'linkedProfiles'
        | 'nickname'
    >
> {
    return queryPersonaRAW(identifier)
}

/** @deprecated */
export async function queryMyPersonas(
    network?: string,
): Promise<
    Pick<
        Persona,
        | 'nickname'
        | 'identifier'
        | 'fingerprint'
        | 'publicHexKey'
        | 'linkedProfiles'
        | 'uninitialized'
        | 'createdAt'
        | 'hasPrivateKey'
        | 'updatedAt'
    >[]
> {
    const x = (await queryPersonasDB({ hasPrivateKey: true })).map(personaRecordToPersona)
    if (typeof network === 'string') {
        return x.filter((y) => {
            for (const z of y.linkedProfiles.keys()) {
                if (z.network === network) return true
            }
            return false
        })
    }
    return x
}
