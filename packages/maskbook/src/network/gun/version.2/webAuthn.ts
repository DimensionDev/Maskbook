import { hashCredentialID } from './hash'
import type { EC_Private_JsonWebKey, EC_Public_JsonWebKey } from '@masknet/shared-base'
import { encodeArrayBuffer } from '@dimensiondev/kit'
const globalCredentialRegistry = new Map<string, Set<ArrayBuffer>>()
const globalKeyRegistry = new Map<string, Set<ArrayBuffer>>()
const globalSignCountRegistry = new Map<string, number>()

export async function increaseSignCountOnGlobalRegistry(credentialID: ArrayBuffer): Promise<void> {
    // todo: refactor use `gun2` API
    const id = encodeArrayBuffer(credentialID)
    globalSignCountRegistry.set(id, (globalSignCountRegistry.get(id) ?? 0) + 1)
}

export async function getSignCountOnGlobalRegistry(credentialID: ArrayBuffer): Promise<number> {
    // todo: refactor use `gun2` API
    const id = encodeArrayBuffer(credentialID)
    return globalSignCountRegistry.get(id) || (globalSignCountRegistry.set(id, 0), 0)
}

export async function searchKeyOnGlobalRegistry(credentialID: ArrayBuffer) {
    // todo: refactor use `gun2` API
    const id = encodeArrayBuffer(credentialID)
    return [...(globalKeyRegistry.get(id) || [])]
}

export async function publishKeyOnGlobalRegistry(
    credentialID: ArrayBuffer,
    secretKey: CryptoKey,
    iv: ArrayBuffer,
    data: ArrayBuffer,
) {
    // todo: refactor use `gun2` API
    const id = encodeArrayBuffer(credentialID)
    const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, secretKey, data)
    const set = globalKeyRegistry.get(id) || new Set<ArrayBuffer>([encrypted])
    if (!set) {
        globalKeyRegistry.set(id, set)
    } else {
        set.add(encrypted)
    }
}

export async function searchCredentialOnGlobalRegistry(
    publicKey: EC_Public_JsonWebKey,
    rpID: string,
): Promise<ArrayBuffer[]> {
    // todo: refactor use `gun2` API
    const credentialIDHash = await hashCredentialID(publicKey, rpID)
    const set = globalCredentialRegistry.get(credentialIDHash) || new Set<ArrayBuffer>()
    if (!set) {
        globalCredentialRegistry.set(credentialIDHash, set)
    }
    return [...set.values()]
}

export async function publishCredentialOnGlobalRegistry(
    privateKey: EC_Private_JsonWebKey,
    rpID: string,
    credentialID: ArrayBuffer,
) {
    // todo: refactor use `gun2` API
    const publicKey = { ...privateKey, d: undefined } as EC_Public_JsonWebKey
    const key = await hashCredentialID(publicKey, rpID)
    globalCredentialRegistry.get(key)!.add(credentialID)
}
