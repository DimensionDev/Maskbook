import {
    personaRecordToPersona,
    queryAvatarDataURL,
    queryPersona as queryPersonaRAW,
    queryPostPagedDB,
    queryProfile,
    queryProfilesWithQuery,
    storeAvatar,
} from '../../database'
import type { PersonaIdentifier, ProfileIdentifier, PostIVIdentifier } from '@masknet/shared-base'
import type { Persona, Profile } from '../../database/Persona/types'
import {
    queryPersonaDB,
    queryPersonasDB,
    queryRelationsPagedDB,
    RelationRecord,
} from '../../../background/database/persona/db'

import { assertEnvironment, Environment } from '@dimensiondev/holoflows-kit'
import { getCurrentPersonaIdentifier } from './SettingsService'
import { MaskMessages } from '../../utils'

assertEnvironment(Environment.ManifestBackground)

export * from '../../../background/services/identity'

export { queryProfile, queryPersonaByProfile } from '../../database'

/** @deprecated */
export function queryProfiles(network?: string): Promise<Profile[]> {
    return queryProfilesWithQuery({ network })
}

export function queryProfilesWithIdentifiers(identifiers: ProfileIdentifier[]) {
    return queryProfilesWithQuery({ identifiers })
}
export async function queryMyProfiles(network?: string): Promise<Profile[]> {
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

async function queryPersonas_inner(identifier?: PersonaIdentifier, requirePrivateKey = false): Promise<Persona[]> {
    if (typeof identifier === 'undefined')
        return (await queryPersonasDB({ hasPrivateKey: requirePrivateKey })).map(personaRecordToPersona)
    const x = await queryPersonaDB(identifier)
    if (!x || (!x.privateKey && requirePrivateKey)) return []
    return [personaRecordToPersona(x)]
}

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
    const x = await queryPersonas_inner(undefined, true)
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

export async function queryPagedPostHistory(
    options: {
        network: string
        userIds: string[]
        after?: PostIVIdentifier
        pageOffset?: number
    },
    count: number,
) {
    const currentPersona = await getCurrentPersonaIdentifier()
    if (currentPersona) {
        return queryPostPagedDB(currentPersona, options, count)
    }

    return []
}

export async function queryRelationPaged(
    options: {
        network: string
        after?: RelationRecord
        pageOffset?: number
    },
    count: number,
): Promise<RelationRecord[]> {
    const currentPersona = await getCurrentPersonaIdentifier()
    if (currentPersona) {
        return queryRelationsPagedDB(currentPersona, options, count)
    }

    return []
}

export async function updateCurrentPersonaAvatar(avatar: Blob) {
    const identifier = await getCurrentPersonaIdentifier()

    if (identifier) {
        await storeAvatar(identifier, await avatar.arrayBuffer())
        MaskMessages.events.ownPersonaChanged.sendToAll(undefined)
    }
}

export async function getCurrentPersonaAvatar() {
    const identifier = await getCurrentPersonaIdentifier()
    if (!identifier) return null

    try {
        return await queryAvatarDataURL(identifier)
    } catch {
        return null
    }
}
