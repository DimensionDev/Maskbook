import { encodeArrayBuffer } from '@dimensiondev/kit'
import {
    decrypt,
    parsePayload,
    DecryptProgressKind,
    EC_KeyCurveEnum,
    DecryptProgress,
    SocialNetworkEnum,
    SocialNetworkEnumToProfileDomain,
    EC_Key,
    socialNetworkDecoder,
    steganographyDecodeImage,
    DecryptError,
    DecryptErrorReasons,
    DecryptReportedInfo,
} from '@masknet/encryption'
import {
    AESCryptoKey,
    ECKeyIdentifierFromJsonWebKey,
    EC_JsonWebKey,
    EC_Public_JsonWebKey,
    PostIVIdentifier,
    ProfileIdentifier,
} from '@masknet/shared-base'
import type { TypedMessage } from '@masknet/typed-message'
import { noop } from 'lodash-unified'
import { queryProfileDB, queryPersonaDB } from '../../database/persona/db'
import {
    createProfileWithPersona,
    decryptByLocalKey,
    deriveAESByECDH,
    hasLocalKeyOf,
    queryPublicKey,
} from '../../database/persona/helper'
import { queryPostDB } from '../../database/post'
import { savePostKeyToDB } from '../../database/post/helper'
import {
    GUN_queryPostKey_version37,
    GUN_queryPostKey_version39Or38,
    GUN_queryPostKey_version40,
} from '../../network/gun/encryption/queryPostKey'

export interface DecryptionContext {
    currentSocialNetwork: SocialNetworkEnum
    currentProfile: ProfileIdentifier | null
    authorHint: ProfileIdentifier | null
    postURL: string | undefined
}
export type SocialNetworkEncodedPayload =
    | { type: 'text'; text: string }
    | { type: 'image'; image: Blob }
    | { type: 'image-url'; image: string }
const downloadImage = (url: string): Promise<ArrayBuffer> => fetch(url).then((x) => x.arrayBuffer())

/**
 *
 * @param encoded If the encoded content is a text, it should only contain 1 payload. Extra payload will be ignored.
 * @param context
 */
export async function* decryptionWithSocialNetworkDecoding(
    encoded: SocialNetworkEncodedPayload,
    context: DecryptionContext,
): AsyncGenerator<DecryptProgress, void, undefined> {
    let decoded: string | Uint8Array
    if (encoded.type === 'text') {
        decoded = socialNetworkDecoder(context.currentSocialNetwork, encoded.text)[0]
    } else {
        if (!context.authorHint) {
            return yield new DecryptError(DecryptErrorReasons.UnrecognizedAuthor, undefined)
        }
        const result = await steganographyDecodeImage(encoded.image, {
            pass: context.authorHint.toText(),
            downloadImage,
        })
        decoded = socialNetworkDecoder(context.currentSocialNetwork, result)[0]
    }

    if (!decoded) return yield new DecryptError(DecryptErrorReasons.NoPayloadFound, undefined)
    yield* decryption(decoded, context)
}

const inMemoryCache = new Map<PostIVIdentifier, TypedMessage>()
async function* decryption(payload: string | Uint8Array, context: DecryptionContext) {
    const parse = await parsePayload(payload)
    if (parse.err) return null

    const { currentSocialNetwork, postURL, currentProfile, authorHint } = context

    // #region Identify the PostIdentifier
    const iv = parse.val.encryption.unwrapOr(null)?.iv.unwrapOr(null)
    {
        if (!iv) return null
        // iv is required to identify the post and it also used in comment encryption.
        const info: DecryptReportedInfo = {
            type: DecryptProgressKind.Info,
            iv,
            version: parse.val.version,
        }
        if (parse.val.encryption.ok) {
            const val = parse.val.encryption.val
            info.publicShared = val.type === 'public'
            if (val.type === 'E2E') info.isAuthorOfPost = val.ownersAESKeyEncrypted.ok
        }
        yield info
    }
    const id = new PostIVIdentifier(
        SocialNetworkEnumToProfileDomain(currentSocialNetwork),
        encodeArrayBuffer(new Uint8Array(iv.buffer)),
    )
    // #endregion

    if (inMemoryCache.has(id)) {
        const p: DecryptProgress = { type: DecryptProgressKind.Success, content: inMemoryCache.get(id)! }
        return void (yield p)
    }

    // #region store author public key into the database
    try {
        const id = parse.unwrap().author.unwrap().unwrap()
        if (!hasStoredAuthorPublicKey.has(id)) {
            storeAuthorPublicKey(id, authorHint, parse.unwrap().authorPublicKey.unwrap().unwrap()).catch(noop)
            hasStoredAuthorPublicKey.add(id)
        }
    } catch {}
    // #endregion

    const progress = decrypt(
        {
            message: parse.val,
            onDecrypted(message) {
                inMemoryCache.set(id, message)
            },
        },
        {
            getPostKeyCache: getPostKeyCache.bind(null, id),
            setPostKeyCache: (key) => {
                return savePostKeyToDB(id, key, {
                    // public post will not call this function.
                    // and recipients only will be set when posting/appending recipients.
                    recipients: new Map(),
                    postBy: authorHint || parse.safeUnwrap().author.unwrapOr(undefined)?.unwrapOr(undefined),
                    url: postURL,
                })
            },
            hasLocalKeyOf,
            decryptByLocalKey,
            async deriveAESKey(pub) {
                return Array.from((await deriveAESByECDH(pub)).values())
            },
            queryAuthorPublicKey(author, signal) {
                return queryPublicKey(author || authorHint)
            },
            async *queryPostKey_version37(iv, signal) {
                const author = await queryPublicKey(context.currentProfile)
                if (!author)
                    throw new DecryptError(DecryptErrorReasons.CurrentProfileDoesNotConnectedToPersona, undefined)
                yield* GUN_queryPostKey_version37(
                    iv,
                    author,
                    context.currentSocialNetwork,
                    signal || new AbortController().signal,
                )
            },
            async *queryPostKey_version38(iv, signal) {
                const author = await queryPublicKey(context.currentProfile)
                if (!author)
                    throw new DecryptError(DecryptErrorReasons.CurrentProfileDoesNotConnectedToPersona, undefined)
                yield* GUN_queryPostKey_version39Or38(
                    -38,
                    iv,
                    author,
                    context.currentSocialNetwork,
                    signal || new AbortController().signal,
                )
            },
            async *queryPostKey_version39(iv, signal) {
                const author = await queryPublicKey(context.currentProfile)
                if (!author)
                    throw new DecryptError(DecryptErrorReasons.CurrentProfileDoesNotConnectedToPersona, undefined)
                yield* GUN_queryPostKey_version39Or38(
                    -39,
                    iv,
                    author,
                    context.currentSocialNetwork,
                    signal || new AbortController().signal,
                )
            },
            async queryPostKey_version40(iv) {
                if (!currentProfile) return null
                return GUN_queryPostKey_version40(iv, currentProfile.userId)
            },
        },
    )

    yield* progress
    return null
}

/** @internal */
export async function getPostKeyCache(id: PostIVIdentifier) {
    const post = await queryPostDB(id)
    if (!post?.postCryptoKey) return null
    const k = await crypto.subtle.importKey('jwk', post.postCryptoKey, { name: 'AES-GCM', length: 256 }, true, [
        'decrypt',
    ])
    return k as AESCryptoKey
}

const hasStoredAuthorPublicKey = new Set<ProfileIdentifier>()
async function storeAuthorPublicKey(
    payloadAuthor: ProfileIdentifier,
    postAuthor: ProfileIdentifier | null,
    pub: EC_Key,
) {
    if (payloadAuthor !== postAuthor) {
        // ! Author detected is not equal to AuthorHint.
        // ! Skip store the public key because it might be a security problem.
        return
    }
    if (pub.algr !== EC_KeyCurveEnum.secp256k1) {
        throw new Error('TODO: support other curves')
    }

    // if privateKey, we should possibly not recreate it
    const profile = await queryProfileDB(payloadAuthor)
    const persona = profile?.linkedPersona ? await queryPersonaDB(profile.linkedPersona) : undefined
    if (persona?.privateKey) return

    const key = (await crypto.subtle.exportKey('jwk', pub.key)) as EC_JsonWebKey
    const otherPersona = await queryPersonaDB(await ECKeyIdentifierFromJsonWebKey(key))
    if (otherPersona?.privateKey) return

    return createProfileWithPersona(
        payloadAuthor,
        { connectionConfirmState: 'confirmed' },
        {
            publicKey: (await crypto.subtle.exportKey('jwk', pub.key)) as EC_Public_JsonWebKey,
        },
    )
}
