import {
    AESCryptoKey,
    AESJsonWebKey,
    ECKeyIdentifier,
    EC_Private_JsonWebKey,
    EC_Public_CryptoKey,
    IdentifierMap,
    ProfileIdentifier,
} from '@masknet/shared-base'
import type { IDBPSafeTransaction } from '../utils/openDB'
import { createReadonlyPersonaTransaction, PersonaDB } from './db'

//#region Local key helpers
/**
 * If has local key of a profile in the database.
 * @param id Profile Identifier
 */
export async function hasLocalKeyOf(
    id: ProfileIdentifier,
    tx?: IDBPSafeTransaction<PersonaDB, ['personas', 'profiles'], 'readonly'>,
) {
    const result = await getLocalKeyOf(id, tx)
    return !!result
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
    search: {
        if (!authorHint) break search
        const tx = (await createReadonlyPersonaTransaction())('personas', 'profiles')
        const key = await getLocalKeyOf(authorHint, tx)
        key && candidateKeys.push(key)
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

async function getLocalKeyOf(
    id: ProfileIdentifier,
    tx?: IDBPSafeTransaction<PersonaDB, ['personas', 'profiles'], 'readonly'>,
) {
    tx ||= (await createReadonlyPersonaTransaction())('personas', 'profiles')

    const profile = await tx.objectStore('profiles').get(id.toText())
    if (!profile) return
    if (profile.localKey) return profile.localKey
    if (!profile.linkedPersona) return

    const persona = await tx.objectStore('personas').get(profile.linkedPersona.toText())
    return persona?.localKey
}
//#endregion

//#region ECDH
export async function deriveAESByECDH(pub: EC_Public_CryptoKey) {
    const curve = (pub.algorithm as EcKeyAlgorithm).namedCurve || ''
    const sameCurvePrivateKeys = new Map<string, EC_Private_JsonWebKey>()

    db: {
        const t = (await createReadonlyPersonaTransaction())('personas')
        const hasPriv = await t.objectStore('personas').index('hasPrivateKey').openCursor(IDBKeyRange.only('yes'))
        if (hasPriv === null) break db
        for await (const { value } of hasPriv) {
            if (!value.privateKey) continue
            if (value.privateKey.crv !== curve) continue
            sameCurvePrivateKeys.set(value.identifier, value.privateKey)
        }
    }

    const deriveResult = new Map<string, AESCryptoKey>()
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
                false,
                ['encrypt', 'decrypt'],
            )
            deriveResult.set(id, result as AESCryptoKey)
        }),
    )
    const failed = result.filter((x): x is PromiseRejectedResult => x.status === 'rejected')
    if (failed.length) {
        console.warn('Failed to ECDH', ...failed.map((x) => x.reason))
    }
    return new IdentifierMap<ECKeyIdentifier, AESCryptoKey>(deriveResult, ECKeyIdentifier)
}
//#endregion

function abort() {
    throw new Error('Cancelled')
}
