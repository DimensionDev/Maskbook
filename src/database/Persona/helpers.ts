import { ProfileIdentifier, PersonaIdentifier, ECKeyIdentifier } from '../type'
import type { Profile, Persona } from './types'
import {
    ProfileRecord,
    queryProfilesDB,
    PersonaRecord,
    queryProfileDB,
    queryPersonaDB,
    queryPersonasDB,
    detachProfileDB,
    deletePersonaDB,
    safeDeletePersonaDB,
    queryPersonaByProfileDB,
    createPersonaDB,
    attachProfileDB,
    LinkedProfileDetails,
    consistentPersonaDBWriteAccess,
    updatePersonaDB,
    createOrUpdatePersonaDB,
    queryProfilesPagedDB,
} from './Persona.db'
import { IdentifierMap } from '../IdentifierMap'
import { getAvatarDataURL } from '../helpers/avatar'
import { generate_ECDH_256k1_KeyPair_ByMnemonicWord } from '../../utils/mnemonic-code'
import { deriveLocalKeyFromECDHKey } from '../../utils/mnemonic-code/localKeyGenerate'
import { importNewWallet, isEmptyWallets } from '../../plugins/Wallet/wallet'
import type {
    EC_Public_JsonWebKey,
    AESJsonWebKey,
    EC_Private_JsonWebKey,
} from '../../modules/CryptoAlgorithm/interfaces/utils'

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

export async function queryProfilePaged(...args: Parameters<typeof queryProfilesPagedDB>): Promise<Profile[]> {
    const _ = await queryProfilesPagedDB(...args)
    return Promise.all(_.map(profileRecordToProfile))
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
    const _ = await queryProfilesDB(query || ((_) => true))
    return Promise.all(_.map(profileRecordToProfile))
}

/**
 * Select a set of Personas
 */
export async function queryPersonasWithQuery(query?: Parameters<typeof queryPersonasDB>[0]): Promise<Persona[]> {
    const _ = await queryPersonasDB(query || ((_) => true))
    return _.map(personaRecordToPersona)
}

export async function deletePersona(id: PersonaIdentifier, confirm: 'delete even with private' | 'safe delete') {
    return consistentPersonaDBWriteAccess(async (t) => {
        const d = await queryPersonaDB(id, t as any)
        if (!d) return
        for (const e of d.linkedProfiles) {
            await detachProfileDB(e[0], t as any)
        }
        if (confirm === 'delete even with private') await deletePersonaDB(id, 'delete even with private', t as any)
        else if (confirm === 'safe delete') await safeDeletePersonaDB(id, t as any)
    })
}

export async function renamePersona(identifier: PersonaIdentifier, nickname: string) {
    return consistentPersonaDBWriteAccess((t) =>
        updatePersonaDB(
            { identifier, nickname },
            { linkedProfiles: 'merge', explicitUndefinedField: 'ignore' },
            t as any,
        ),
    )
}
export async function queryPersonaByProfile(i: ProfileIdentifier) {
    return (await queryProfile(i)).linkedPersona
}

export function queryPersonaRecord(i: ProfileIdentifier | PersonaIdentifier): Promise<PersonaRecord | null> {
    return i instanceof ProfileIdentifier ? queryPersonaByProfileDB(i) : queryPersonaDB(i)
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

    // TODO: move to plugin logic
    if (await isEmptyWallets()) {
        importNewWallet({
            name: null,
            mnemonic: mnemonic.words.split(' '),
            passphrase: password,
            _wallet_is_default: true,
        })
    }

    return createPersonaByJsonWebKey({
        privateKey,
        publicKey,
        localKey,
        mnemonic,
        nickname,
    })
}

export async function createPersonaByJsonWebKey(options: {
    publicKey: EC_Public_JsonWebKey
    privateKey: EC_Private_JsonWebKey
    localKey?: AESJsonWebKey
    nickname?: string
    mnemonic?: PersonaRecord['mnemonic']
}): Promise<PersonaIdentifier> {
    const identifier = ECKeyIdentifier.fromJsonWebKey(options.publicKey)
    const record: PersonaRecord = {
        createdAt: new Date(),
        updatedAt: new Date(),
        identifier: identifier,
        linkedProfiles: new IdentifierMap(new Map(), ProfileIdentifier),
        publicKey: options.publicKey,
        privateKey: options.privateKey,
        nickname: options.nickname,
        mnemonic: options.mnemonic,
        localKey: options.localKey,
    }
    await consistentPersonaDBWriteAccess((t) => createPersonaDB(record, t as any))
    return identifier
}
export async function createProfileWithPersona(
    profileID: ProfileIdentifier,
    data: LinkedProfileDetails,
    keys: {
        nickname?: string
        publicKey: EC_Public_JsonWebKey
        privateKey?: EC_Private_JsonWebKey
        localKey?: AESJsonWebKey
        mnemonic?: PersonaRecord['mnemonic']
    },
): Promise<void> {
    const ec_id = ECKeyIdentifier.fromJsonWebKey(keys.publicKey)
    const rec: PersonaRecord = {
        createdAt: new Date(),
        updatedAt: new Date(),
        identifier: ec_id,
        linkedProfiles: new IdentifierMap(new Map(), ProfileIdentifier),
        nickname: keys.nickname,
        publicKey: keys.publicKey,
        privateKey: keys.privateKey,
        localKey: keys.localKey,
        mnemonic: keys.mnemonic,
    }
    await consistentPersonaDBWriteAccess(async (t) => {
        await createOrUpdatePersonaDB(rec, { explicitUndefinedField: 'ignore', linkedProfiles: 'merge' }, t as any)
        await attachProfileDB(profileID, ec_id, data, t)
    })
}

export async function queryLocalKey(i: ProfileIdentifier | PersonaIdentifier): Promise<AESJsonWebKey | null> {
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
