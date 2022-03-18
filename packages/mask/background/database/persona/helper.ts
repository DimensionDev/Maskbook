import { safeUnreachable } from '@dimensiondev/kit'
import {
    AESCryptoKey,
    AESJsonWebKey,
    ECKeyIdentifier,
    ECKeyIdentifierFromJsonWebKey,
    EC_Private_JsonWebKey,
    EC_Public_CryptoKey,
    EC_Public_JsonWebKey,
    IdentifierMap,
    PersonaIdentifier,
    ProfileIdentifier,
} from '@masknet/shared-base'
import {
    attachProfileDB,
    consistentPersonaDBWriteAccess,
    createOrUpdatePersonaDB,
    createPersonaDB,
    createPersonaDBReadonlyAccess,
    FullPersonaDBTransaction,
    LinkedProfileDetails,
    PersonaRecord,
    queryPersonaByProfileDB,
    queryPersonasWithPrivateKey,
    queryProfileDB,
} from './db'

// #region Local key helpers
/**
 * If has local key of a profile in the database.
 * @param id Profile Identifier
 */
export async function hasLocalKeyOf(id: ProfileIdentifier) {
    let has = false
    await createPersonaDBReadonlyAccess(async (tx) => {
        const result = await getLocalKeyOf(id, tx)
        has = !!result
    })
    return has
}

/**
 * Try to decrypt data using local key.
 *
 * @param authorHint Author of the local key
 * @param data Data to be decrypted
 * @param iv IV
 */
export async function decryptByLocalKey(
    authorHint: ProfileIdentifier | null,
    data: Uint8Array,
    iv: Uint8Array,
): Promise<Uint8Array> {
    const candidateKeys: AESJsonWebKey[] = []

    if (authorHint) {
        await createPersonaDBReadonlyAccess(async (tx) => {
            const key = await getLocalKeyOf(authorHint, tx)
            key && candidateKeys.push(key)
        })
        // TODO: We may push every local key we owned to the candidate list so we can also decrypt when authorHint is null, but that might be a performance pitfall when localKey field is not indexed.
    }

    let check = () => {}
    return Promise.any(
        candidateKeys.map(async (key): Promise<Uint8Array> => {
            const k = await crypto.subtle.importKey('jwk', key, { name: 'AES-GCM', length: 256 }, false, ['decrypt'])
            check()

            const result: Uint8Array = await crypto.subtle.decrypt({ iv, name: 'AES-GCM' }, k, data)
            check = abort
            return result
        }),
    )
}

export async function encryptByLocalKey(who: ProfileIdentifier, content: Uint8Array, iv: Uint8Array) {
    let key: AESCryptoKey | undefined
    await createPersonaDBReadonlyAccess(async (tx) => {
        const jwk = await getLocalKeyOf(who, tx)
        if (!jwk) return
        const k = await crypto.subtle.importKey('jwk', jwk, { name: 'AES-GCM', length: 256 }, false, ['encrypt'])
        key = k as AESCryptoKey
    })
    if (!key) throw new Error('No local key found')
    const result = await crypto.subtle.encrypt({ iv, name: 'AES-GCM' }, key, content)
    return result as Uint8Array
}

async function getLocalKeyOf(id: ProfileIdentifier, tx: FullPersonaDBTransaction<'readonly'>) {
    const profile = await queryProfileDB(id, tx)
    if (!profile) return
    if (profile.localKey) return profile.localKey
    if (!profile.linkedPersona) return

    const persona = await queryPersonaByProfileDB(id, tx)
    return persona?.localKey
}
// #endregion

// #region ECDH
export async function deriveAESByECDH(pub: EC_Public_CryptoKey, of?: ProfileIdentifier | PersonaIdentifier) {
    const curve = (pub.algorithm as EcKeyAlgorithm).namedCurve || ''
    const sameCurvePrivateKeys = new IdentifierMap<ECKeyIdentifier, EC_Private_JsonWebKey>(new Map(), ECKeyIdentifier)

    await createPersonaDBReadonlyAccess(async (tx) => {
        const personas = await queryPersonasWithPrivateKey(tx)
        for (const persona of personas) {
            if (!persona.privateKey) continue
            if (persona.privateKey.crv !== curve) continue
            if (of) {
                if (of instanceof ProfileIdentifier) {
                    if (!persona.linkedProfiles.has(of)) continue
                } else if (of instanceof ECKeyIdentifier) {
                    if (!persona.identifier.equals(of)) continue
                } else safeUnreachable(of)
            }
            sameCurvePrivateKeys.set(persona.identifier, persona.privateKey)
        }
    })

    const deriveResult = new IdentifierMap<ECKeyIdentifier, AESCryptoKey>(new Map(), ECKeyIdentifier)
    const result = await Promise.allSettled(
        [...sameCurvePrivateKeys].map(async ([id, key]) => {
            const privateKey = await crypto.subtle.importKey(
                'jwk',
                key,
                { name: 'ECDH', namedCurve: key.crv! } as EcKeyAlgorithm,
                false,
                ['deriveKey'],
            )
            const derived = await crypto.subtle.deriveKey(
                { name: 'ECDH', public: pub },
                privateKey,
                { name: 'AES-GCM', length: 256 },
                true,
                ['encrypt', 'decrypt'],
            )
            deriveResult.set(id, derived as AESCryptoKey)
        }),
    )
    const failed = result.filter((x): x is PromiseRejectedResult => x.status === 'rejected')
    if (failed.length) {
        console.warn('Failed to ECDH', ...failed.map((x) => x.reason))
    }
    return deriveResult
}
// #endregion

// #region normal functions
export async function createPersonaByJsonWebKey(options: {
    publicKey: EC_Public_JsonWebKey
    privateKey: EC_Private_JsonWebKey
    localKey?: AESJsonWebKey
    nickname?: string
    mnemonic?: PersonaRecord['mnemonic']
    uninitialized?: boolean
}): Promise<PersonaIdentifier> {
    const identifier = ECKeyIdentifierFromJsonWebKey(options.publicKey)
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
        hasLogout: false,
        uninitialized: options.uninitialized,
    }
    await consistentPersonaDBWriteAccess((t) => createPersonaDB(record, t))
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
    const ec_id = ECKeyIdentifierFromJsonWebKey(keys.publicKey)
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
        hasLogout: false,
    }
    await consistentPersonaDBWriteAccess(async (t) => {
        await createOrUpdatePersonaDB(rec, { explicitUndefinedField: 'ignore', linkedProfiles: 'merge' }, t)
        await attachProfileDB(profileID, ec_id, data, t)
    })
}
// #endregion

export async function queryPublicKey(author: ProfileIdentifier | null) {
    if (!author) return null
    const persona = await queryPersonaByProfileDB(author)
    if (!persona) return null
    return (await crypto.subtle.importKey(
        'jwk',
        persona.publicKey,
        { name: 'ECDH', namedCurve: persona.publicKey.crv! } as EcKeyAlgorithm,
        true,
        ['deriveKey'],
    )) as EC_Public_CryptoKey
}

function abort() {
    throw new Error('Cancelled')
}
