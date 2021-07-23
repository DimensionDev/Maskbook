export type AllowedAlgorithms =
    | AlgorithmIdentifier
    | RsaHashedImportParams
    | EcKeyImportParams
    | HmacImportParams
    | DhImportKeyParams
    | AesKeyAlgorithm

export async function jwkToArrayBuffer(
    key: JsonWebKey,
    algorithm: AllowedAlgorithms = {
        name: 'ECDH',
        namedCurve: 'P-256',
    },
): Promise<ArrayBuffer> {
    const keyObject = await crypto.subtle.importKey('jwk', key, algorithm, true, [])
    return crypto.subtle.exportKey('raw', keyObject)
}

export async function cryptoKeyToPublic(key: CryptoKey) {
    const jwk = await crypto.subtle.exportKey('jwk', key)
    delete jwk.d
    return crypto.subtle.importKey('jwk', jwk, key.algorithm, key.extractable, key.usages)
}
