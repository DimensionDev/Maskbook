import {
    personaRecordToPersona,
    profileRecordToProfile,
    queryPersona as queryPersonaRAW,
    queryProfile,
} from '../../database'
import type { PersonaIdentifier, ProfileIdentifier } from '@masknet/shared-base'
import type { Persona, Profile } from '../../database/Persona/types'
import { queryPersonasDB, queryProfilesDB } from '../../../background/database/persona/db'

import { assertEnvironment, Environment } from '@dimensiondev/holoflows-kit'

assertEnvironment(Environment.ManifestBackground)

export * from '../../../background/services/identity'

export async function mobile_queryProfilesWithIdentifiers(identifiers: ProfileIdentifier[]): Promise<Profile[]> {
    if (process.env.architecture !== 'app') throw new Error('This function is only available in the app')
    const _ = await queryProfilesDB({ identifiers })
    return Promise.all(_.map(profileRecordToProfile))
}

export async function mobile_queryMyProfiles(network?: string): Promise<Profile[]> {
    if (process.env.architecture !== 'app') throw new Error('This function is only available in the app')
    const myPersonas = (await queryMyPersonas(network)).filter((x) => !x.uninitialized)
    return Promise.all(
        myPersonas
            .flatMap((x) => Array.from(x.linkedProfiles.keys()))
            .filter((y) => !network || network === y.network)
            .map(queryProfile),
    )
}

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
