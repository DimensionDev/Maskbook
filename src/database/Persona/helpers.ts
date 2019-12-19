import { ProfileIdentifier, PersonaIdentifier, ECKeyIdentifier } from '../type'
import { Profile, Persona } from './types'
import {
    ProfileRecord,
    queryProfilesDB,
    PersonaRecord,
    queryProfileDB,
    queryPersonaDB,
    queryPersonasDB,
    PersonaDBAccess,
    detachProfileDB,
    deletePersonaDB,
    safeDeletePersonaDB,
    updateProfileDB,
    createProfileDB,
    queryPersonaByProfileDB,
    createPersonaDB,
    attachProfileDB,
    LinkedProfileDetails,
    PersonaDB,
    updatePersonaDB,
} from './Persona.db'
import { IdentifierMap } from '../IdentifierMap'
import { getAvatarDataURL } from '../helpers/avatar'
import {
    JsonWebKeyToCryptoKey,
    CryptoKeyToJsonWebKey,
    getKeyParameter,
} from '../../utils/type-transform/CryptoKey-JsonWebKey'
import { MessageCenter, UpdateEvent } from '../../utils/messages'
import { generate_ECDH_256k1_KeyPair_ByMnemonicWord } from '../../utils/mnemonic-code'
import { deriveLocalKeyFromECDHKey } from '../../utils/mnemonic-code/localKeyGenerate'
import { IDBPTransaction } from 'idb'

export async function profileRecordToProfile(record: ProfileRecord): Promise<Profile> {
    const rec = { ...record }
    const persona = rec.linkedPersona
    delete rec.linkedPersona
    delete rec.localKey
    const _ = persona ? queryPersona(persona) : undefined
    const _2 = getAvatarDataURL(rec.identifier).catch(() => undefined)
    return {
        ...rec,
        linkedPersona: await _,
        avatar: await _2,
    }
}
export function personaRecordToPersona(record: PersonaRecord): Persona {
    const rec = { ...record }
    delete rec.localKey
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
    const _ = await queryProfileDB(identifier)
    if (_) return profileRecordToProfile(_)
    return {
        identifier,
        createdAt: new Date(),
        updatedAt: new Date(),
    }
}

/**
 * Query a persona even it is not stored in the database.
 * @param identifier - Identifier for people want to query
 */
export async function queryPersona(identifier: PersonaIdentifier): Promise<Persona> {
    const _ = await queryPersonaDB(identifier)
    if (_) return personaRecordToPersona(_)
    return {
        identifier,
        createdAt: new Date(),
        updatedAt: new Date(),
        linkedProfiles: new IdentifierMap(new Map(), ProfileIdentifier),
        hasPrivateKey: false,
        fingerprint: identifier.compressedPoint,
    }
}

/**
 * Select a set of Profiles
 */
export async function queryProfilesWithQuery(query?: Parameters<typeof queryProfilesDB>[0]): Promise<Profile[]> {
    const _ = await queryProfilesDB(query || (_ => true))
    return Promise.all(_.map(profileRecordToProfile))
}

/**
 * Select a set of Profiles
 */
export async function queryPersonasWithQuery(query?: Parameters<typeof queryPersonasDB>[0]): Promise<Persona[]> {
    const _ = await queryPersonasDB(query || (_ => true))
    return _.map(personaRecordToPersona)
}

export async function deletePersona(id: PersonaIdentifier, confirm: 'delete even with private' | 'safe delete') {
    const t: IDBPTransaction<PersonaDB, any> = (await PersonaDBAccess()).transaction(
        ['profiles', 'personas'],
        'readwrite',
    )
    const d = await queryPersonaDB(id, t)
    if (!d) return
    for (const e of d.linkedProfiles) {
        await detachProfileDB(e[0], t)
    }
    if (confirm === 'delete even with private') await deletePersonaDB(id, 'delete even with private', t)
    else if (confirm === 'safe delete') await safeDeletePersonaDB(id, t)
}

export async function renamePersona(identifier: PersonaIdentifier, nickname: string) {
    return updatePersonaDB({ identifier, nickname })
}

export async function queryPersonaByProfile(i: ProfileIdentifier) {
    return (await queryProfile(i)).linkedPersona
}

export function queryPersonaRecord(i: ProfileIdentifier | PersonaIdentifier): Promise<PersonaRecord | null> {
    return i instanceof ProfileIdentifier ? queryPersonaByProfileDB(i) : queryPersonaDB(i)
}

export async function queryPublicKey(i: ProfileIdentifier | PersonaIdentifier): Promise<CryptoKey | undefined> {
    const jwk = (await queryPersonaRecord(i))?.publicKey
    if (jwk) return JsonWebKeyToCryptoKey(jwk, ...getKeyParameter('ecdh'))
    return undefined
}
export async function queryPrivateKey(i: ProfileIdentifier | PersonaIdentifier): Promise<CryptoKey | undefined> {
    const jwk = (await queryPersonaRecord(i))?.privateKey
    if (jwk) return JsonWebKeyToCryptoKey(jwk, ...getKeyParameter('ecdh'))
    return undefined
}

export async function createPersonaByMnemonic(
    nickname: string | undefined,
    password: string,
): Promise<PersonaIdentifier> {
    const key = await generate_ECDH_256k1_KeyPair_ByMnemonicWord(password)
    const jwkPub = await CryptoKeyToJsonWebKey(key.key.publicKey)
    const jwkPriv = await CryptoKeyToJsonWebKey(key.key.privateKey)
    const localKey = await deriveLocalKeyFromECDHKey(key.key.publicKey, key.mnemonicRecord.words)
    const jwkLocalKey = await CryptoKeyToJsonWebKey(localKey)

    return createPersonaByJsonWebKey({
        privateKey: jwkPriv,
        publicKey: jwkPub,
        localKey: jwkLocalKey,
        mnemonic: key.mnemonicRecord,
        nickname: nickname,
    })
}

export async function createPersonaByJsonWebKey(options: {
    publicKey: JsonWebKey
    privateKey: JsonWebKey
    localKey?: JsonWebKey
    nickname?: string
    mnemonic?: PersonaRecord['mnemonic']
}): Promise<PersonaIdentifier> {
    const identifier = ECKeyIdentifier.fromJsonWebKey(options.publicKey)
    await createPersonaDB({
        createdAt: new Date(),
        updatedAt: new Date(),
        identifier: identifier,
        linkedProfiles: new IdentifierMap(new Map(), ProfileIdentifier),
        publicKey: options.publicKey,
        privateKey: options.privateKey,
        nickname: options.nickname,
        mnemonic: options.mnemonic,
        localKey: options.localKey
            ? await JsonWebKeyToCryptoKey(options.localKey, ...getKeyParameter('aes'))
            : undefined,
    })
    return identifier
}
export async function createProfileWithPersona(
    i: ProfileIdentifier,
    data: LinkedProfileDetails,
    keys: {
        publicKey: JsonWebKey
        privateKey?: JsonWebKey
        localKey?: CryptoKey
        mnemonic?: PersonaRecord['mnemonic']
    },
): Promise<void> {
    const ec_id = ECKeyIdentifier.fromJsonWebKey(keys.publicKey)

    const t = (await PersonaDBAccess()).transaction(['personas', 'profiles'], 'readwrite')
    await createPersonaDB({
        createdAt: new Date(),
        updatedAt: new Date(),
        identifier: ec_id,
        linkedProfiles: new IdentifierMap(new Map(), ProfileIdentifier),
        publicKey: keys.publicKey,
        privateKey: keys.privateKey,
        localKey: keys.localKey,
        mnemonic: keys.mnemonic,
    })
    await attachProfileDB(i, ec_id, data, t)
}

export async function queryLocalKey(i: ProfileIdentifier | PersonaIdentifier): Promise<CryptoKey | null> {
    if (i instanceof ProfileIdentifier) {
        const profile = await queryProfileDB(i)
        if (!profile) return null
        if (profile.localKey) return profile.localKey
        if (!profile.linkedPersona) return null
        return queryLocalKey(profile.linkedPersona)
    } else {
        return (await queryPersonaDB(i))?.localKey ?? null
    }
}
