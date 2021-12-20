import { encodeArrayBuffer } from '@dimensiondev/kit'
import {
    decrypt,
    parsePayload,
    DecryptProgressKind,
    PublicKeyAlgorithmEnum,
    DecryptProgress,
    SocialNetworkEnum,
    SocialNetworkEnumToProfileDomain,
} from '@masknet/encryption'
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
import { GUN_queryPostKey_version39Or38, GUN_queryPostKey_version40 } from '../../network/gun/encryption/queryPostKey'
import type { GunRoot } from '../../network/gun/utils'

export type DecryptionInfo = {
    type: DecryptProgressKind.Info
    iv?: Uint8Array
}
export type DecryptionProgress = DecryptProgress | DecryptionInfo

export interface DecryptionContext {
    currentSocialNetwork: SocialNetworkEnum
    currentProfile: ProfileIdentifier | null
    authorHint: ProfileIdentifier | null
    postURL: string | undefined
}
export type SocialNetworkEncodedPayload =
    | { type: 'text'; text: string }
    | { type: 'image'; image: Uint8Array }
    | { type: 'image-url'; url: string }

export async function* decryptionWithSocialNetworkDecoding(
    encoded: SocialNetworkEncodedPayload,
    context: DecryptionContext,
) {
    let decoded!: string | Uint8Array
    return yield* decryption(decoded, context)
}
export async function* decryption(payload: string | Uint8Array, context: DecryptionContext) {
    const { currentSocialNetwork, postURL } = context
    let { currentProfile, authorHint } = context
    if (currentProfile?.isUnknown) currentProfile = null
    if (authorHint?.isUnknown) authorHint = null

    const parse = await parsePayload(payload)
    if (parse.err) return null

    //#region Identify the PostIdentifier
    const iv = parse.val.encryption.unwrapOr(null)?.iv.unwrapOr(null)
    {
        if (!iv) return null
        // iv is required to identify the post and it also used in comment encryption.
        const info: DecryptionInfo = { type: DecryptProgressKind.Info, iv }
        yield info
    }
    const id = new PostIVIdentifier(
        SocialNetworkEnumToProfileDomain(currentSocialNetwork),
        encodeArrayBuffer(iv.buffer),
    )
    //#endregion

    // TODO: read in-memory cache to avoid db lookup

    //#region Store author public key
    try {
        const author = parse.unwrap().author.unwrap().unwrap()
        const authorPub = parse.unwrap().authorPublicKey.unwrap().unwrap()
        if (author.equals(authorHint)) {
            // TODO: store the public key
            if (authorPub.algr !== PublicKeyAlgorithmEnum.secp256k1) throw new Error('TODO: support other curves')
        } else {
            // ! Author detected is not equal to AuthorHint. Skip store the public key because it might be a security problem.
        }
    } catch {}
    //#endregion

    const progress = decrypt(
        { message: parse.val },
        {
            getPostKeyCache: getPostKeyCache.bind(null, id),
            setPostKeyCache: (key) => {
                return savePostKeyToDB(id, key, {
                    // public post will not call this function.
                    // and recipients only will be set when posting/appending recipients.
                    recipients: new IdentifierMap(new Map()),
                    postBy:
                        authorHint ||
                        parse.safeUnwrap().author.unwrapOr(null)?.unwrapOr(null) ||
                        ProfileIdentifier.unknown,
                    url: postURL,
                })
            },
            hasLocalKeyOf: hasLocalKeyOf,
            decryptByLocalKey: decryptByLocalKey,
            async deriveAESKey(pub) {
                return Array.from((await deriveAESByECDH(pub)).values())
            },
            async queryAuthorPublicKey(author, signal) {
                author ||= authorHint
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
            // TODO: get a gun instance
            async *queryPostKey_version37() {
                throw 'TODO'
            },
            async *queryPostKey_version38(iv, signal) {
                yield* GUN_queryPostKey_version39Or38(
                    {} as GunRoot,
                    -38,
                    iv,
                    {} as any,
                    '',
                    signal || new AbortController().signal,
                )
            },
            async *queryPostKey_version39(iv, signal) {
                yield* GUN_queryPostKey_version39Or38(
                    {} as GunRoot,
                    -39,
                    iv,
                    {} as any,
                    '',
                    signal || new AbortController().signal,
                )
            },
            async queryPostKey_version40(iv) {
                if (!currentProfile) return null
                return GUN_queryPostKey_version40({} as GunRoot, iv, currentProfile)
            },
        },
    )

    yield* progress
    return null
}
async function getPostKeyCache(id: PostIVIdentifier) {
    const post = await queryPostDB(id)
    if (!post?.postCryptoKey) return null
    const k = await crypto.subtle.importKey('jwk', post.postCryptoKey, { name: 'AES-GCM', length: 256 }, false, [
        'decrypt',
    ])
    return k as AESCryptoKey
}
