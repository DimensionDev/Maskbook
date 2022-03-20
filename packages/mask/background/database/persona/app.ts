import type {
    PersonaRecord,
    FullPersonaDBTransaction,
    PersonasTransaction,
    PersonaRecordWithPrivateKey,
    ProfileRecord,
    ProfileTransaction,
    RelationRecord,
    RelationTransaction,
    LinkedProfileDetails,
} from './type'
import {
    ProfileIdentifier,
    PersonaIdentifier,
    Identifier,
    IdentifierMap,
    ECKeyIdentifier,
    EC_Public_JsonWebKey,
    EC_Private_JsonWebKey,
    AESJsonWebKey,
} from '@masknet/shared-base'
import { nativeAPI } from '../../../shared/native-rpc'
import type {
    PersonaRecord as NativePersonaRecord,
    ProfileRecord as NativeProfileRecord,
    RelationRecord as NativeRelationRecord,
    EC_Private_JsonWebKey as Native_EC_Private_JsonWebKey,
    EC_Public_JsonWebKey as Native_EC_Public_JsonWebKey,
    AESJsonWebKey as Native_AESJsonWebKey,
} from '@masknet/public-api'
import { MaskMessages } from '../../../shared'
import { convertPersonaHexPublicKey } from './util'

export async function createPersonaDBReadonlyAccess(action: () => Promise<void>) {
    await action()
}
export async function consistentPersonaDBWriteAccess(action: () => Promise<void>) {
    await action()
}

export async function createPersonaDB(record: PersonaRecord): Promise<void> {
    await nativeAPI?.api.create_persona({
        persona: personaRecordToDB(record),
    })
}

export async function queryPersonaByProfileDB(
    query: ProfileIdentifier,
    t?: FullPersonaDBTransaction<'readonly'>,
): Promise<PersonaRecord | null> {
    const x = await nativeAPI?.api.query_persona_by_profile({
        options: {
            profileIdentifier: query.toText(),
        },
    })

    if (!x) return null

    return personaRecordOutDB(x)
}

export async function queryPersonaDB(
    query: PersonaIdentifier,
    t?: PersonasTransaction<'readonly'>,
    isIncludeLogout?: boolean,
): Promise<PersonaRecord | null> {
    const x = await nativeAPI?.api.query_persona({
        identifier: query.toText(),
        includeLogout: isIncludeLogout,
    })
    if (!x) return null
    return personaRecordOutDB(x)
}

export async function queryPersonasDB(
    query: {
        identifiers?: PersonaIdentifier[]
        hasPrivateKey?: boolean
        nameContains?: string
        initialized?: boolean
    },
    t?: PersonasTransaction<'readonly'>,
    isIncludeLogout?: boolean,
): Promise<PersonaRecord[]> {
    const results = await nativeAPI?.api.query_personas({
        ...query,
        includeLogout: isIncludeLogout,
    })

    if (!results) return []
    return results.map((x) => personaRecordOutDB(x))
}

export async function queryPersonasWithPrivateKey(): Promise<PersonaRecordWithPrivateKey[]> {
    const results = await nativeAPI?.api.query_personas({
        hasPrivateKey: true,
    })

    if (!results) return []
    return results.map((x) => personaRecordOutDB(x)) as PersonaRecordWithPrivateKey[]
}

/**
 * Update an existing Persona record.
 * @param nextRecord The partial record to be merged
 * @param howToMerge How to merge linkedProfiles and `field: undefined`
 * @param t transaction
 */

export async function updatePersonaDB( // Do a copy here. We need to delete keys from it.
    { ...nextRecord }: Readonly<Partial<PersonaRecord> & Pick<PersonaRecord, 'identifier'>>,
    howToMerge: {
        linkedProfiles: 'replace' | 'merge'
        explicitUndefinedField: 'ignore' | 'delete field'
    },
    t?: PersonasTransaction<'readwrite'>,
): Promise<void> {
    return nativeAPI?.api.update_persona({
        persona: partialPersonaRecordToDB(nextRecord),
        options: {
            linkedProfileMergePolicy: howToMerge.linkedProfiles === 'replace' ? 0 : 1,
            deleteUndefinedFields: howToMerge.explicitUndefinedField !== 'ignore',
        },
    })
}

export async function createOrUpdatePersonaDB(
    record: Partial<PersonaRecord> & Pick<PersonaRecord, 'identifier' | 'publicKey'>,
    howToMerge: Parameters<typeof updatePersonaDB>[1] & { protectPrivateKey?: boolean },
    t?: PersonasTransaction<'readwrite'>,
): Promise<void> {
    return nativeAPI?.api.update_persona({
        persona: partialPersonaRecordToDB(record),
        options: {
            linkedProfileMergePolicy: howToMerge.linkedProfiles === 'replace' ? 0 : 1,
            deleteUndefinedFields: howToMerge.explicitUndefinedField !== 'ignore',
            protectPrivateKey: howToMerge.protectPrivateKey,
            createWhenNotExist: true,
        },
    })
}

/**
 * Delete a Persona
 */
export async function deletePersonaDB(
    id: PersonaIdentifier,
    confirm: 'delete even with private' | "don't delete if have private key",
    t?: PersonasTransaction<'readwrite'>,
): Promise<void> {
    return nativeAPI?.api.delete_persona({
        identifier: id.toText(),
        options: {
            safeDelete: confirm === 'delete even with private',
        },
    })
}

/**
 * Delete a Persona
 * @returns a boolean. true: the record no longer exists; false: the record is kept.
 */
export async function safeDeletePersonaDB(
    id: PersonaIdentifier,
    t?: FullPersonaDBTransaction<'readwrite'>,
): Promise<void> {
    return deletePersonaDB(id, "don't delete if have private key")
}

/**
 * Create a new profile.
 */
export async function createProfileDB(record: ProfileRecord, t?: ProfileTransaction<'readwrite'>): Promise<void> {
    await nativeAPI?.api.create_profile({
        profile: profileRecordToDB(record),
    })
    MaskMessages.events.profilesChanged.sendToAll([{ of: record.identifier, reason: 'update' }])
}

/**
 * Query a profile.
 */
export async function queryProfileDB(
    id: ProfileIdentifier,
    t?: ProfileTransaction<'readonly'>,
): Promise<ProfileRecord | null> {
    const x = await nativeAPI?.api.query_profile({
        options: {
            identifier: id.toText(),
        },
    })

    if (x) return profileRecordOutDB(x)

    return null
}

/**
 * Query many profiles.
 */
export async function queryProfilesDB(
    query: {
        network?: string
        identifiers?: ProfileIdentifier[]
        hasLinkedPersona?: boolean
    },
    t?: ProfileTransaction<'readonly'>,
): Promise<ProfileRecord[]> {
    const profiles = await nativeAPI?.api.query_profiles({
        identifiers: query.identifiers?.map((x) => x.toText()),
        network: query.network,
        hasLinkedPersona: query.hasLinkedPersona,
    })

    if (!profiles) return []
    return profiles.map((x) => profileRecordOutDB(x))
}

/**
 * @deprecated
 * query profiles with paged
 * @param options
 * @param count
 */
export async function queryProfilesPagedDB(
    options: {
        after?: ProfileIdentifier
        query?: string
    },
    count: number,
): Promise<ProfileRecord[]> {
    return []
}

/**
 * Update a profile.
 */
export async function updateProfileDB(
    updating: Partial<ProfileRecord> & Pick<ProfileRecord, 'identifier'>,
    t?: ProfileTransaction<'readwrite'>,
): Promise<void> {
    return nativeAPI?.api.update_profile({
        profile: partialProfileRecordToDB(updating),
    })
}

export async function createOrUpdateProfileDB(rec: ProfileRecord, t?: ProfileTransaction<'readwrite'>): Promise<void> {
    return nativeAPI?.api.update_profile({
        profile: partialProfileRecordToDB(rec),
        options: {
            createWhenNotExist: true,
        },
    })
}

/**
 * Detach a profile from it's linking persona.
 * @param identifier The profile want to detach
 * @param t A living transaction
 */
export async function detachProfileDB(
    identifier: ProfileIdentifier,
    t?: FullPersonaDBTransaction<'readwrite'>,
): Promise<void> {
    return nativeAPI?.api.detach_profile({
        identifier: identifier.toText(),
    })
}

/**
 * attach a profile.
 */
export async function attachProfileDB(
    identifier: ProfileIdentifier,
    attachTo: PersonaIdentifier,
    data: LinkedProfileDetails,
): Promise<void> {
    await nativeAPI?.api.attach_profile({
        profileIdentifier: identifier.toText(),
        personaIdentifier: attachTo.toText(),
        state: data,
    })

    const persona = await queryPersonaDB(attachTo)

    if (persona?.privateKey) MaskMessages.events.ownPersonaChanged.sendToAll(undefined)
}

/**
 * Delete a profile
 */
export async function deleteProfileDB(id: ProfileIdentifier, t?: ProfileTransaction<'readwrite'>): Promise<void> {
    await nativeAPI?.api.delete_profile({
        identifier: id.toText(),
    })
    MaskMessages.events.profilesChanged.sendToAll([{ reason: 'delete', of: id }])
}

/**
 * Create a new Relation
 */
export async function createRelationDB(
    record: Omit<RelationRecord, 'network'>,
    t?: RelationTransaction<'readwrite'>,
    silent = false,
): Promise<void> {
    await nativeAPI?.api.create_relation({
        relation: relationRecordToDB(record),
    })

    if (!silent)
        MaskMessages.events.relationsChanged.sendToAll([{ of: record.profile, reason: 'update', favor: record.favor }])
}

export async function queryRelations(
    query: (record: RelationRecord) => boolean,
    t?: RelationTransaction<'readonly'>,
): Promise<RelationRecord[]> {
    const results = await nativeAPI?.api.query_relations({})

    if (!results?.length) return []
    return results.map((x) => relationRecordOutDB(x))
}

export async function queryRelationsPagedDB(
    linked: PersonaIdentifier,
    options: {
        network: string
        after?: RelationRecord
        pageOffset?: number
    },
    count: number,
): Promise<RelationRecord[]> {
    const results = await nativeAPI?.api.query_relations({
        options: {
            network: options.network,
            pageOption: options.pageOffset
                ? {
                      pageSize: count,
                      pageOffset: options.pageOffset,
                  }
                : undefined,
        },
    })

    if (!results?.length) return []
    return results.map((x) => relationRecordOutDB(x))
}

/**
 * Update a relation
 * @param updating
 * @param t
 * @param silent
 */
export async function updateRelationDB(
    updating: Omit<RelationRecord, 'network'>,
    t?: RelationTransaction<'readwrite'>,
    silent = false,
): Promise<void> {
    await nativeAPI?.api.update_relation({
        relation: relationRecordToDB(updating),
    })
    if (!silent) {
        MaskMessages.events.relationsChanged.sendToAll([
            { of: updating.profile, favor: updating.favor, reason: 'update' },
        ])
    }
}

// #region out db & to db
function personaRecordToDB(x: PersonaRecord): NativePersonaRecord {
    return {
        ...x,
        publicKey: x.publicKey as JsonWebKey as unknown as Native_EC_Public_JsonWebKey,
        privateKey: x.privateKey as JsonWebKey as unknown as Native_EC_Private_JsonWebKey,
        localKey: x.localKey as JsonWebKey as unknown as Native_AESJsonWebKey,
        identifier: x.identifier.toText(),
        linkedProfiles: Object.fromEntries(x.linkedProfiles.__raw_map__),
        createdAt: x.createdAt.getTime(),
        updatedAt: x.createdAt.getTime(),
    }
}

function partialPersonaRecordToDB(
    x: Readonly<Partial<PersonaRecord> & Pick<PersonaRecord, 'identifier'>>,
): Partial<NativePersonaRecord> {
    return {
        publicKey: x.publicKey as JsonWebKey as unknown as Native_EC_Public_JsonWebKey,
        privateKey: x.privateKey as JsonWebKey as unknown as Native_EC_Private_JsonWebKey,
        localKey: x.localKey as JsonWebKey as unknown as Native_AESJsonWebKey,
        identifier: x.identifier.toText(),
        linkedProfiles: x.linkedProfiles?.__raw_map__ ? Object.fromEntries(x.linkedProfiles.__raw_map__) : {},
        createdAt: x.createdAt?.getTime(),
        updatedAt: x.createdAt?.getTime(),
    }
}

function personaRecordOutDB(x: NativePersonaRecord): PersonaRecord {
    const identifier = Identifier.fromString(x.identifier, ECKeyIdentifier).unwrap()

    return {
        publicKey: x.publicKey as JsonWebKey as unknown as EC_Public_JsonWebKey,
        publicHexKey: convertPersonaHexPublicKey(identifier),
        privateKey: x.privateKey as JsonWebKey as unknown as EC_Private_JsonWebKey,
        localKey: x.localKey as JsonWebKey as unknown as AESJsonWebKey,
        identifier,
        linkedProfiles: new IdentifierMap(new Map(Object.entries(x.linkedProfiles)), ProfileIdentifier),
        createdAt: new Date(x.createdAt),
        updatedAt: new Date(x.updatedAt),
    }
}

function profileRecordToDB(x: ProfileRecord): NativeProfileRecord {
    return {
        ...x,
        identifier: x.identifier.toText(),
        localKey: x.localKey as JsonWebKey as unknown as Native_AESJsonWebKey,
        linkedPersona: x.linkedPersona?.toText(),
        createdAt: x.createdAt.getTime(),
        updatedAt: x.updatedAt.getTime(),
    }
}

function profileRecordOutDB(x: NativeProfileRecord): ProfileRecord {
    return {
        localKey: x.localKey as JsonWebKey as unknown as AESJsonWebKey,
        identifier: Identifier.fromString(x.identifier, ProfileIdentifier).unwrap(),
        linkedPersona: x.linkedPersona ? Identifier.fromString(x.linkedPersona, ECKeyIdentifier).unwrap() : undefined,
        createdAt: new Date(x.createdAt),
        updatedAt: new Date(x.updatedAt),
    }
}

function partialProfileRecordToDB(
    x: Readonly<Partial<ProfileRecord> & Pick<ProfileRecord, 'identifier'>>,
): Partial<NativeProfileRecord> {
    return {
        ...x,
        identifier: x.identifier.toText(),
        localKey: x.localKey as JsonWebKey as unknown as Native_AESJsonWebKey,
        linkedPersona: x.linkedPersona?.toText(),
        createdAt: x.createdAt?.getTime(),
        updatedAt: x.updatedAt?.getTime(),
    }
}

function relationRecordToDB(x: Omit<RelationRecord, 'network'>): Omit<NativeRelationRecord, 'network'> {
    return {
        ...x,
        profile: x.profile.toText(),
        linked: x.linked.toText(),
    }
}

function relationRecordOutDB(x: NativeRelationRecord): RelationRecord {
    return {
        ...x,
        profile: Identifier.fromString(x.profile, ProfileIdentifier).unwrap(),
        linked: Identifier.fromString(x.linked, ECKeyIdentifier).unwrap(),
    }
}
// #endregion
