import type { Profile, Persona } from './types'
import * as backgroundService from '@masknet/background-service'
import {
    generate_ECDH_256k1_KeyPair_ByMnemonicWord,
    recover_ECDH_256k1_KeyPair_ByMnemonicWord,
} from '../../utils/mnemonic-code'
import { deriveLocalKeyFromECDHKey } from '../../utils/mnemonic-code/localKeyGenerate'
import { validateMnemonic } from 'bip39'
import {
    ProfileIdentifier,
    type PersonaIdentifier,
    IdentifierMap,
    type EC_Public_JsonWebKey,
    type EC_Private_JsonWebKey,
    type AESJsonWebKey,
    ECKeyIdentifierFromJsonWebKey,
} from '@masknet/shared-base'

export async function profileRecordToProfile(record: backgroundService.ProfileRecord): Promise<Profile> {
    const rec = { ...record }
    const persona = rec.linkedPersona
    delete rec.linkedPersona
    delete rec.localKey
    const _ = persona ? queryPersona(persona) : undefined
    const _2 = backgroundService.queryAvatarDataURL(rec.identifier).catch(() => undefined)
    return {
        ...rec,
        linkedPersona: await _,
        avatar: await _2,
    }
}
export function personaRecordToPersona(record: backgroundService.PersonaRecord): Persona {
    const rec = { ...record }
    delete rec.localKey
    // @ts-ignore
    delete rec.publicKey
    const hasPrivateKey = !!rec.privateKey
    delete rec.privateKey
    return {
        ...rec,
        hasPrivateKey,
        fingerprint: rec.identifier.compressedPoint,
    }
}

/**
 * Query a Profile even it is not stored in the database.
 * @param identifier - Identifier for people want to query
 */
export async function queryProfile(identifier: ProfileIdentifier): Promise<Profile> {
    const _ = await backgroundService.db.queryProfileDB(identifier)
    if (_) return profileRecordToProfile(_)
    return {
        identifier,
        createdAt: new Date(),
        updatedAt: new Date(),
    }
}

export async function queryProfilePaged(
    ...args: Parameters<typeof backgroundService.db.queryProfilesPagedDB>
): Promise<Profile[]> {
    const _ = await backgroundService.db.queryProfilesPagedDB(...args)
    return Promise.all(_.map(profileRecordToProfile))
}

/**
 * Query a persona even it is not stored in the database.
 * @param identifier - Identifier for people want to query
 */
export async function queryPersona(identifier: PersonaIdentifier): Promise<Persona> {
    const _ = await backgroundService.db.queryPersonaDB(identifier)
    if (_) return personaRecordToPersona(_)
    return {
        identifier,
        createdAt: new Date(),
        updatedAt: new Date(),
        linkedProfiles: new IdentifierMap(new Map(), ProfileIdentifier),
        hasPrivateKey: false,
        hasLogout: false,
        fingerprint: identifier.compressedPoint,
    }
}

/**
 * Select a set of Profiles
 */
export async function queryProfilesWithQuery(
    query: Parameters<typeof backgroundService.db.queryProfilesDB>[0],
): Promise<Profile[]> {
    const _ = await backgroundService.db.queryProfilesDB(query)
    return Promise.all(_.map(profileRecordToProfile))
}

/**
 * Select a set of Personas
 */
export async function queryPersonasWithQuery(
    query?: Parameters<typeof backgroundService.db.queryPersonasDB>[0],
): Promise<Persona[]> {
    const _ = await backgroundService.db.queryPersonasDB(query)
    return _.map(personaRecordToPersona)
}

export async function deletePersona(id: PersonaIdentifier, confirm: 'delete even with private' | 'safe delete') {
    return backgroundService.db.consistentPersonaDBWriteAccess(async (t) => {
        const d = await backgroundService.db.queryPersonaDB(id, t)
        if (!d) return
        for (const e of d.linkedProfiles) {
            await backgroundService.db.detachProfileDB(e[0], t)
        }
        if (confirm === 'delete even with private')
            await backgroundService.db.deletePersonaDB(id, 'delete even with private', t)
        else if (confirm === 'safe delete') await backgroundService.db.safeDeletePersonaDB(id, t)
    })
}

export async function loginPersona(identifier: PersonaIdentifier) {
    return backgroundService.db.consistentPersonaDBWriteAccess((t) =>
        backgroundService.db.updatePersonaDB(
            { identifier, hasLogout: false },
            { linkedProfiles: 'merge', explicitUndefinedField: 'ignore' },
            t,
        ),
    )
}

export async function logoutPersona(identifier: PersonaIdentifier) {
    return backgroundService.db.consistentPersonaDBWriteAccess((t) =>
        backgroundService.db.updatePersonaDB(
            { identifier, hasLogout: true },
            { linkedProfiles: 'merge', explicitUndefinedField: 'ignore' },
            t,
        ),
    )
}

export async function renamePersona(identifier: PersonaIdentifier, nickname: string) {
    const personas = await queryPersonasWithQuery({ nameContains: nickname })
    if (personas.length > 0) {
        throw new Error('Nickname already exists')
    }

    return backgroundService.db.consistentPersonaDBWriteAccess((t) =>
        backgroundService.db.updatePersonaDB(
            { identifier, nickname },
            { linkedProfiles: 'merge', explicitUndefinedField: 'ignore' },
            t,
        ),
    )
}

export async function setupPersona(id: PersonaIdentifier) {
    return backgroundService.db.consistentPersonaDBWriteAccess(async (t) => {
        const d = await backgroundService.db.queryPersonaDB(id, t)
        if (!d) throw new Error('cannot find persona')
        if (d.linkedProfiles.size === 0) throw new Error('persona should link at least one profile')
        if (d.uninitialized) {
            await backgroundService.db.updatePersonaDB(
                { identifier: id, uninitialized: false },
                { linkedProfiles: 'merge', explicitUndefinedField: 'ignore' },
                t,
            )
        }
    })
}

export async function queryPersonaByProfile(i: ProfileIdentifier) {
    return (await queryProfile(i)).linkedPersona
}

export function queryPersonaRecord(
    i: ProfileIdentifier | PersonaIdentifier,
): Promise<backgroundService.PersonaRecord | null> {
    return i instanceof ProfileIdentifier
        ? backgroundService.db.queryPersonaByProfileDB(i)
        : backgroundService.db.queryPersonaDB(i)
}

export async function queryPublicKey(
    i: ProfileIdentifier | PersonaIdentifier,
): Promise<EC_Public_JsonWebKey | undefined> {
    return queryPersonaRecord(i).then((x) => x?.publicKey)
}
export async function queryPrivateKey(
    i: ProfileIdentifier | PersonaIdentifier,
): Promise<EC_Private_JsonWebKey | undefined> {
    return queryPersonaRecord(i).then((x) => x?.privateKey)
}

export async function createPersonaByMnemonic(
    nickname: string | undefined,
    password: string,
): Promise<PersonaIdentifier> {
    const { key, mnemonicRecord: mnemonic } = await generate_ECDH_256k1_KeyPair_ByMnemonicWord(password)
    const { privateKey, publicKey } = key
    const localKey = await deriveLocalKeyFromECDHKey(publicKey, mnemonic.words)
    return createPersonaByJsonWebKey({
        privateKey,
        publicKey,
        localKey,
        mnemonic,
        nickname,
        uninitialized: false,
    })
}

export async function createPersonaByMnemonicV2(mnemonicWord: string, nickname: string | undefined, password: string) {
    const personas = await queryPersonasWithQuery({ nameContains: nickname })
    if (personas.length > 0) throw new Error('Nickname already exists')

    const verify = validateMnemonic(mnemonicWord)
    if (!verify) throw new Error('Verify error')

    const { key, mnemonicRecord: mnemonic } = await recover_ECDH_256k1_KeyPair_ByMnemonicWord(mnemonicWord, password)
    const { privateKey, publicKey } = key
    const localKey = await deriveLocalKeyFromECDHKey(publicKey, mnemonic.words)
    return createPersonaByJsonWebKey({
        privateKey,
        publicKey,
        localKey,
        mnemonic,
        nickname,
        uninitialized: false,
    })
}

export async function createPersonaByJsonWebKey(options: {
    publicKey: EC_Public_JsonWebKey
    privateKey: EC_Private_JsonWebKey
    localKey?: AESJsonWebKey
    nickname?: string
    mnemonic?: backgroundService.PersonaRecord['mnemonic']
    uninitialized?: boolean
}): Promise<PersonaIdentifier> {
    const identifier = ECKeyIdentifierFromJsonWebKey(options.publicKey)
    const record: backgroundService.PersonaRecord = {
        createdAt: new Date(),
        updatedAt: new Date(),
        identifier: identifier,
        linkedProfiles: new IdentifierMap(new Map(), ProfileIdentifier),
        publicKey: options.publicKey,
        privateKey: options.privateKey,
        nickname: options.nickname,
        mnemonic: options.mnemonic,
        localKey: options.localKey,
        hasLogout: false,
        uninitialized: options.uninitialized,
    }
    await backgroundService.db.consistentPersonaDBWriteAccess((t) => backgroundService.db.createPersonaDB(record, t))
    return identifier
}
export async function createProfileWithPersona(
    profileID: ProfileIdentifier,
    data: backgroundService.db.LinkedProfileDetails,
    keys: {
        nickname?: string
        publicKey: EC_Public_JsonWebKey
        privateKey?: EC_Private_JsonWebKey
        localKey?: AESJsonWebKey
        mnemonic?: backgroundService.PersonaRecord['mnemonic']
    },
): Promise<void> {
    const ec_id = ECKeyIdentifierFromJsonWebKey(keys.publicKey)
    const rec: backgroundService.PersonaRecord = {
        createdAt: new Date(),
        updatedAt: new Date(),
        identifier: ec_id,
        linkedProfiles: new IdentifierMap(new Map(), ProfileIdentifier),
        nickname: keys.nickname,
        publicKey: keys.publicKey,
        privateKey: keys.privateKey,
        localKey: keys.localKey,
        mnemonic: keys.mnemonic,
        hasLogout: false,
    }
    await backgroundService.db.consistentPersonaDBWriteAccess(async (t) => {
        await backgroundService.db.createOrUpdatePersonaDB(
            rec,
            { explicitUndefinedField: 'ignore', linkedProfiles: 'merge' },
            t,
        )
        await backgroundService.db.attachProfileDB(profileID, ec_id, data, t)
    })
}

export async function queryLocalKey(i: ProfileIdentifier | PersonaIdentifier): Promise<AESJsonWebKey | null> {
    if (i instanceof ProfileIdentifier) {
        const profile = await backgroundService.db.queryProfileDB(i)
        if (!profile) return null
        if (profile.localKey) return profile.localKey
        if (!profile.linkedPersona) return null
        return queryLocalKey(profile.linkedPersona)
    } else {
        return (await backgroundService.db.queryPersonaDB(i))?.localKey ?? null
    }
}
function cover_ECDH_256k1_KeyPair_ByMnemonicWord(
    password: string,
): { key: any; mnemonicRecord: any } | PromiseLike<{ key: any; mnemonicRecord: any }> {
    throw new Error('Function not implemented.')
}
