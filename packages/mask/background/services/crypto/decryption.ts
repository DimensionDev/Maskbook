import { encodeArrayBuffer, unreachable } from '@dimensiondev/kit'
import {
    decrypt,
    parsePayload,
    DecryptProgressKind,
    PublicKeyAlgorithmEnum,
    DecryptProgress,
    SocialNetworkEnum,
    SocialNetworkEnumToProfileDomain,
    AsymmetryCryptoKey,
    socialNetworkDecoder,
    steganographyDecodeImageUrl,
    DecryptError,
    ErrorReasons,
} from '@masknet/encryption'
import {
    AESCryptoKey,
    EC_Public_CryptoKey,
    IdentifierMap,
    PostIVIdentifier,
    ProfileIdentifier,
} from '@masknet/shared-base'
import EventIterator from 'event-iterator'
import { queryPersonaByProfileDB } from '../../database/persona/db'
import { decryptByLocalKey, deriveAESByECDH, hasLocalKeyOf } from '../../database/persona/helper'
import { queryPostDB } from '../../database/post'
import { savePostKeyToDB } from '../../database/post/helper'
import { GUN_queryPostKey_version39Or38, GUN_queryPostKey_version40 } from '../../network/gun/encryption/queryPostKey'
import { getGunInstance } from '../../network/gun/instance'

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
    // | { type: 'image'; image: Uint8Array }
    | { type: 'image-url'; url: string }
const downloadImage = (url: string): Promise<ArrayBuffer> => fetch(url).then((x) => x.arrayBuffer())
export async function* decryptionWithSocialNetworkDecoding(
    encoded: SocialNetworkEncodedPayload[],
    context: DecryptionContext,
) {
    yield* new EventIterator<[id: string, progress: DecryptProgress | DecryptionInfo]>((flow) => {
        for (const e of encoded) {
            async function main() {
                const id = Math.random() + ''
                let decoded!: string | Uint8Array
                if (e.type === 'text') {
                    // TODO: socialNetworkDecoder should emit multiple results if the text contains multiple payload.
                    decoded = socialNetworkDecoder(context.currentSocialNetwork, e.text).unwrapOr(e.text)
                } else if (e.type === 'image-url') {
                    if (!context.authorHint || context.authorHint.isUnknown) {
                        flow.push([id, new DecryptError(ErrorReasons.UnrecognizedAuthor, undefined)])
                        return
                    }
                    const result = socialNetworkDecoder(
                        context.currentSocialNetwork,
                        await steganographyDecodeImageUrl(e.url, {
                            pass: context.authorHint.toText(),
                            downloadImage,
                        }),
                    )
                    if (result.none) return
                    decoded = result.val
                }
                for await (const x of decryption(decoded, context)) flow.push([id, x])
            }
            main()
        }
    })
}
export async function* decryption(payload: string | Uint8Array, context: DecryptionContext) {
    const parse = await parsePayload(payload)
    if (parse.err) return null

    const { currentSocialNetwork, postURL } = context
    let { currentProfile, authorHint } = context
    if (currentProfile?.isUnknown) currentProfile = null
    if (authorHint?.isUnknown) authorHint = null

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

    try {
        storeAuthorPublicKey(
            parse.unwrap().author.unwrap().unwrap(),
            authorHint,
            parse.unwrap().authorPublicKey.unwrap().unwrap(),
        )
    } catch {}

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
            queryAuthorPublicKey(author, signal) {
                return queryPublicKey(author || authorHint, false, signal)
            },
            // TODO: get a gun instance
            async *queryPostKey_version37() {
                throw 'TODO'
            },
            async *queryPostKey_version38(iv, signal) {
                const author = await queryPublicKey(context.currentProfile, true)
                if (!author) throw new DecryptError(ErrorReasons.CurrentProfileDoesNotConnectedToPersona, undefined)
                yield* GUN_queryPostKey_version39Or38(
                    getGunInstance(),
                    -38,
                    iv,
                    author,
                    getNetworkHint(context.currentSocialNetwork),
                    signal || new AbortController().signal,
                )
            },
            async *queryPostKey_version39(iv, signal) {
                const author = await queryPublicKey(context.currentProfile, true)
                if (!author) throw new DecryptError(ErrorReasons.CurrentProfileDoesNotConnectedToPersona, undefined)
                yield* GUN_queryPostKey_version39Or38(
                    getGunInstance(),
                    -39,
                    iv,
                    author,
                    getNetworkHint(context.currentSocialNetwork),
                    signal || new AbortController().signal,
                )
            },
            async queryPostKey_version40(iv) {
                if (!currentProfile) return null
                return GUN_queryPostKey_version40(getGunInstance(), iv, currentProfile.userId)
            },
        },
    )

    yield* progress
    return null
}

function getNetworkHint(x: SocialNetworkEnum) {
    if (x === SocialNetworkEnum.Facebook) return ''
    if (x === SocialNetworkEnum.Twitter) return 'twitter-'
    if (x === SocialNetworkEnum.Minds) return 'minds-'
    if (x === SocialNetworkEnum.Instagram) return 'instagram-'
    unreachable(x)
}

async function getPostKeyCache(id: PostIVIdentifier) {
    const post = await queryPostDB(id)
    if (!post?.postCryptoKey) return null
    const k = await crypto.subtle.importKey('jwk', post.postCryptoKey, { name: 'AES-GCM', length: 256 }, false, [
        'decrypt',
    ])
    return k as AESCryptoKey
}

async function storeAuthorPublicKey(
    payloadAuthor: ProfileIdentifier,
    postAuthor: ProfileIdentifier | null,
    pub: AsymmetryCryptoKey,
) {
    if (payloadAuthor.equals(postAuthor)) {
        if (pub.algr !== PublicKeyAlgorithmEnum.secp256k1) {
            throw new Error('TODO: support other curves')
        }
        // TODO: store the key
    }
    // ! Author detected is not equal to AuthorHint. Skip store the public key because it might be a security problem.
}

async function queryPublicKey(author: ProfileIdentifier | null, extractable = false, signal?: AbortSignal) {
    if (!author) return null
    const persona = await queryPersonaByProfileDB(author)
    if (!persona) return null
    return (await crypto.subtle.importKey(
        'jwk',
        persona.publicKey,
        { name: 'ECDH', namedCurve: persona.publicKey.crv! } as EcKeyAlgorithm,
        extractable,
        ['deriveKey'],
    )) as EC_Public_CryptoKey
}
