import { encodeArrayBuffer } from '@dimensiondev/kit'
import {
    AESCryptoKey,
    EC_Public_CryptoKey,
    IdentifierMap,
    PostIVIdentifier,
    ProfileIdentifier,
} from '@masknet/shared-base'
import { queryPersonaByProfileDB } from '../../database/persona/db'
import { decryptByLocalKey, deriveAESByECDH, hasLocalKeyOf } from '../../database/persona/helper'
import { queryPostDB } from '../../database/post'
import { savePostKeyToDB } from '../../database/post/helper'

export async function* decryption(payload: string | Uint8Array, network: string) {
    // This module required to be loaded async because it contains WebAssembly import.
    // If it join the sync module graph of the whole application, it will fail due to unknown reason.
    const { decrypt, parsePayload } = await import('@masknet/encryption')

    const parse = await parsePayload(payload)
    if (parse.err) return null

    const iv = parse.val.encryption.unwrapOr(null)?.iv.unwrapOr(null)
    if (!iv) return null
    const id = new PostIVIdentifier(network, encodeArrayBuffer(iv.buffer))

    yield* decrypt(
        { message: parse.val },
        {
            getPostKeyCache: getPostKeyCache.bind(null, id),
            setPostKeyCache: (key) => {
                return savePostKeyToDB(id, key, {
                    // public post will not call this function.
                    // and recipients only will be set when posting/appending recipients.
                    recipients: new IdentifierMap(new Map()),
                    // TODO: fill this
                    postBy: ProfileIdentifier.unknown,
                    // TODO: fill this
                    // url,
                })
            },
            hasLocalKeyOf: hasLocalKeyOf,
            decryptByLocalKey: decryptByLocalKey,
            async deriveAESKey(pub) {
                return Array.from((await deriveAESByECDH(pub)).values())
            },
            async queryAuthorPublicKey(author, signal) {
                // TODO: should use decrypt hint as the value
                if (!author) return null
                const persona = await queryPersonaByProfileDB(author)
                if (!persona) return null
                return (await crypto.subtle.importKey(
                    'jwk',
                    persona.publicKey,
                    { name: 'ECDH', namedCurve: persona.publicKey.crv! } as EcKeyAlgorithm,
                    false,
                    ['deriveKey'],
                )) as EC_Public_CryptoKey
            },
            async *queryPostKey_version37() {
                throw 'TODO'
            },
            async *queryPostKey_version38() {
                throw 'TODO'
            },
            async *queryPostKey_version39() {
                throw 'TODO'
            },
            async queryPostKey_version40() {
                throw 'TODO'
            },
        },
    )
    return
}
async function getPostKeyCache(id: PostIVIdentifier) {
    const post = await queryPostDB(id)
    if (!post?.postCryptoKey) return null
    const k = await crypto.subtle.importKey('jwk', post.postCryptoKey, { name: 'AES-GCM', length: 256 }, false, [
        'decrypt',
    ])
    return k as AESCryptoKey
}
