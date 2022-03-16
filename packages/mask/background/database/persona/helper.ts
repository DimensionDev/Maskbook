import { concatArrayBuffer, decodeArrayBuffer } from '@dimensiondev/kit'
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
export async function deriveAESByECDH(pub: EC_Public_CryptoKey, extractable = true) {
    const curve = (pub.algorithm as EcKeyAlgorithm).namedCurve || ''
    const sameCurvePrivateKeys = new IdentifierMap<ECKeyIdentifier, EC_Private_JsonWebKey>(new Map(), ECKeyIdentifier)

    await createPersonaDBReadonlyAccess(async (tx) => {
        const personas = await queryPersonasWithPrivateKey(tx)
        for (const persona of personas) {
            if (!persona.privateKey) continue
            if (persona.privateKey.crv !== curve) continue
            sameCurvePrivateKeys.set(persona.identifier, persona.privateKey)
        }
    })

    const deriveResult = new IdentifierMap<ECKeyIdentifier, AESCryptoKey>(new Map(), ECKeyIdentifier)
    const result = await Promise.allSettled(
        [...sameCurvePrivateKeys].map(async ([id, key]) => {
            const k = await crypto.subtle.importKey(
                'jwk',
                key,
                { name: 'ECDH', namedCurve: key.crv! } as EcKeyAlgorithm,
                false,
                ['deriveKey'],
            )
            const result = await crypto.subtle.deriveKey(
                { name: 'ECDH', public: pub },
                k,
                { name: 'AES-GCM', length: 256 },
                extractable,
                ['encrypt', 'decrypt'],
            )
            deriveResult.set(id, result as AESCryptoKey)
        }),
    )
    const failed = result.filter((x): x is PromiseRejectedResult => x.status === 'rejected')
    if (failed.length) {
        console.warn('Failed to ECDH', ...failed.map((x) => x.reason))
    }
    return deriveResult
}

const KEY = decodeArrayBuffer('KEY')
const IV = decodeArrayBuffer('IV')
export async function deriveAESByECDH_version38_or_older(
    pub: EC_Public_CryptoKey,
    iv: Uint8Array,
    extractable = false,
) {
    const deriveResult = (await deriveAESByECDH(pub, true)).__raw_map__
    type R = [key: AESCryptoKey, iv: Uint8Array]
    const next_map = new Map<string, R>()

    for (const [id, key] of deriveResult) {
        const derivedKeyRaw = await crypto.subtle.exportKey('raw', key)
        const _a = concatArrayBuffer(derivedKeyRaw, iv)
        const nextAESKeyMaterial = await crypto.subtle.digest('SHA-256', concatArrayBuffer(_a, iv, KEY))
        const iv_pre = new Uint8Array(await crypto.subtle.digest('SHA-256', concatArrayBuffer(_a, iv, IV)))
        const nextIV = new Uint8Array(16)
        for (let i = 0; i <= 16; i += 1) {
            // eslint-disable-next-line no-bitwise
            nextIV[i] = iv_pre[i] ^ iv_pre[16 + i]
        }
        const nextAESKey = await crypto.subtle.importKey(
            'raw',
            nextAESKeyMaterial,
            { name: 'AES-GCM', length: 256 },
            extractable,
            ['encrypt', 'decrypt'],
        )
        next_map.set(id, [nextAESKey as AESCryptoKey, nextIV])
    }

    return new IdentifierMap<ECKeyIdentifier, R>(next_map, ECKeyIdentifier)
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

function abort() {
    throw new Error('Cancelled')
}
