import * as Alpha40 from '../../../crypto/crypto-alpha-40'
import * as Alpha39 from '../../../crypto/crypto-alpha-39'
import { GunAPI as Gun2, GunAPISubscribe as Gun2Subscribe, GunWorker } from '../../../network/gun/'
import { decodeText } from '@dimensiondev/kit'
import { deconstructPayload, Payload } from '../../../utils/type-transform/Payload'
import { i18n } from '../../../../shared-ui/locales_legacy'
import { queryPersonaRecord, queryLocalKey } from '../../../database'
import { ProfileIdentifier, PostIVIdentifier } from '../../../database/type'
import { PostRecord, queryPostDB, updatePostDB } from '../../../../background/database/post'
import { getNetworkWorker, getNetworkWorkerUninitialized } from '../../../social-network/worker'
import { cryptoProviderTable } from './cryptoProviderTable'
import type { PersonaRecord } from '../../../../background/database/persona/db'
import { verifyOthersProve } from './verifyOthersProve'
import { publicSharedAESKey } from '../../../crypto/crypto-alpha-38'
import { DecryptFailedReason } from '../../../utils/constants'
import { asyncIteratorWithResult, memorizeAsyncGenerator } from '../../../utils/type-transform/asyncIteratorHelpers'
import { delay } from '../../../utils/utils'
import type { AESJsonWebKey } from '../../../modules/CryptoAlgorithm/interfaces/utils'
import { steganographyDecodeImageUrl } from './Steganography'
import type { TypedMessage } from '../../../protocols/typed-message'
import stringify from 'json-stable-stringify'
import type { SharedAESKeyGun2 } from '../../../network/gun/version.2'
import { MaskMessages } from '../../../utils/messages'
import { GunAPI } from '../../../network/gun'
import { Err, Ok, Result } from 'ts-results'
import { decodeTextPayloadWorker } from '../../../social-network/utils/text-payload-worker'

type Progress = (
    | { progress: 'finding_person_public_key' | 'finding_post_key' | 'init' | 'decode_post' }
    | { progress: 'intermediate_success'; data: Success }
    | { progress: 'iv_decrypted'; iv: string }
    | { progress: 'payload_decrypted'; decryptedPayloadForImage: Payload }
) & {
    type: 'progress'
    /** if this is true, this progress should not cause UI change. */
    internal: boolean
}
type DebugInfo = {
    debug: 'debug_finding_hash'
    hash: [string, string]
    type: 'debug'
}
type SuccessThrough = 'author_key_not_found' | 'post_key_cached' | 'normal_decrypted'
type Success = {
    type: 'success'
    iv: string
    decryptedPayloadForImage: Payload
    content: TypedMessage
    through: SuccessThrough[]
    internal: boolean
}
type Failure = {
    error: string
    type: 'error'
    internal: boolean
}
export type SuccessDecryption = Success
export type FailureDecryption = Failure
export type DecryptionProgress = Progress
type ReturnOfDecryptPostContentWithProgress = AsyncGenerator<Failure | Progress | DebugInfo, Success | Failure, void>

const successDecryptionCache = new Map<string, Success>()
const makeSuccessResultF =
    (
        cacheKey: string,
        iv: string,
        decryptedPayloadForImage: Payload,
        cryptoProvider: typeof cryptoProviderTable[keyof typeof cryptoProviderTable],
    ) =>
    (rawEncryptedContent: string, through: Success['through']): Success => {
        const success: Success = {
            through,
            iv,
            decryptedPayloadForImage,
            content: cryptoProvider.typedMessageParse(rawEncryptedContent),
            type: 'success',
            internal: false,
        }
        successDecryptionCache.set(cacheKey, success)
        return success
    }

function makeProgress(
    progress: Exclude<Progress['progress'], 'intermediate_success' | 'iv_decrypted' | 'payload_decrypted'> | Success,
    internal = false,
): Progress {
    if (typeof progress === 'string') return { type: 'progress', progress, internal }
    return { type: 'progress', progress: 'intermediate_success', data: progress, internal }
}
function makeError(error: string | Error, internal: boolean = false): Failure {
    if (typeof error === 'string') return { type: 'error', error, internal }
    return makeError(error.message, internal)
}
/**
 * Decrypt message from a user
 * @param post post
 * @param author Post by
 * @param authorNetworkHint When the author is unknown, the decryption (to public) won't die
 * @param whoAmI My username
 * @param publicShared Is this post public shared
 *
 * @description
 * The decrypt process:
 *
 * ## Prepare
 * a. if unknown payload, throw
 * b. if unknown payload version, throw
 *
 * ## Decrypt for version -38, -39 and -40
 * a. read the cache `cachedPostResult`
 * b. find author's public key (See: `findAuthorPublicKey` function)
 *      0. if it is in the payload, use the key in the payload.
 *      1. if there is cache, return the cache
 *      2. if try N times but not finding the key, throw
 * c. if there is cache, return the cache
 * d. try to decrypt by `author` with `decryptAsAuthor`
 * e. try to decrypt by `whoAmI` with `decryptAsAuthor`
 * f. if `author` === `whoAmI`, throw
 * g. find key for `whoAmI` on Gun
 * h. try to decrypt by the key on Gun
 * i. return a Promise
 *      0. if version === -40, throws
 *      1. listen to future new keys on Gun
 *      2. try to decrypt with that key
 */
async function* decryptFromPayloadWithProgress_raw(
    post: Payload,
    author: ProfileIdentifier,
    authorNetworkHint: string,
    whoAmI: ProfileIdentifier,
    discoverURL: string | undefined,
): ReturnOfDecryptPostContentWithProgress {
    const cacheKey = stringify(post)
    if (successDecryptionCache.has(cacheKey)) return successDecryptionCache.get(cacheKey)!
    yield makeProgress('init')

    const authorNetworkWorker = Result.wrap(() =>
        getNetworkWorkerUninitialized(author.isUnknown ? authorNetworkHint : author.network),
    ).andThen((x) => (x ? Ok(x) : Err(new Error('Worker not found'))))
    if (authorNetworkWorker.err) return makeError(authorNetworkWorker.val as Error)

    const data = post
    const { version } = data
    const sharePublic = data.version === -38 ? data.sharedPublic ?? false : false

    if (version === -40 || version === -39 || version === -38) {
        const { encryptedText, iv, version } = data
        const cryptoProvider = cryptoProviderTable[version]
        const makeSuccessResult = makeSuccessResultF(cacheKey, iv, data, cryptoProvider)
        const ownersAESKeyEncrypted = data.version === -38 ? data.AESKeyEncrypted : data.ownersAESKeyEncrypted

        yield { type: 'progress', progress: 'payload_decrypted', decryptedPayloadForImage: data, internal: true }
        yield { type: 'progress', progress: 'iv_decrypted', iv: iv, internal: true }
        // ? Early emit the cache.
        const [cachedPostResult, setPostCache] = await decryptFromCache(data, author, discoverURL)
        if (cachedPostResult) {
            yield makeProgress(makeSuccessResult(cachedPostResult, ['post_key_cached']))
        }

        // ? If the author's key is in the payload, store it.
        if (data.version === -38 && data.authorPublicKey && !author.isUnknown) {
            await verifyOthersProve({ raw: data.authorPublicKey }, author).catch(console.error)
        }
        // ? Find author's public key.
        let authorPersona!: PersonaRecord
        for await (const _ of asyncIteratorWithResult(findAuthorPublicKey(author, !!cachedPostResult))) {
            if (author.isUnknown) break
            if (!_.done) {
                yield _.value
                continue
            }
            const result = _.value
            if (result === 'out of chance')
                return makeError(i18n.t('service_others_key_not_found', { name: author.userId }))
            else if (result === 'use cache')
                return makeSuccessResult(cachedPostResult!, ['author_key_not_found', 'post_key_cached'])
            else authorPersona = result
        }

        // ? Get my public & private key.
        const queryWhoAmI = () => queryPersonaRecord(whoAmI)
        const mine = await queryWhoAmI().then((x) => x || delay(1000).then(queryWhoAmI))
        if (!mine?.privateKey) return makeError(DecryptFailedReason.MyCryptoKeyNotFound)

        const { publicKey: minePublic, privateKey: minePrivate } = mine
        const networkWorker = getNetworkWorkerUninitialized(whoAmI)
        try {
            if (version === -40) throw ''
            const gunNetworkHint = networkWorker!.gunNetworkHint
            const { keyHash, postHash } = await (
                await import('../../../network/gun/version.2/hash')
            ).calculatePostKeyPartition(version, iv, minePublic, gunNetworkHint)
            yield { type: 'debug', debug: 'debug_finding_hash', hash: [postHash, keyHash] }
        } catch {}
        if (cachedPostResult) return makeSuccessResult(cachedPostResult, ['post_key_cached'])

        let lastError: unknown
        /**
         * ? try to decrypt as I am the author
         * ? then try to decrypt as whoAmI
         * ? then try to go through a normal decrypt process
         */
        try {
            const a = decryptAsAuthor(author)
            const b = decryptAsAuthor(whoAmI)
            // ! Don't remove the await
            return await a.catch(() => b)
        } catch (error) {
            lastError = error
        }

        if (author.equals(whoAmI)) {
            // if the decryption process goes here,
            // that means it is failed to decrypt by local identities.
            // If remove this if block, Mask will search the key
            // for the post even that post by myself.
            if (lastError instanceof DOMException) return handleDOMException(lastError)
            console.error(lastError)
            return makeError(i18n.t('service_self_key_decryption_failed'))
        }

        yield makeProgress('finding_post_key')
        const aesKeyEncrypted: Array<Alpha40.PublishedAESKey | SharedAESKeyGun2> = []
        if (version === -40) {
            // Deprecated payload
            // eslint-disable-next-line import/no-deprecated
            const result = await GunAPI.queryVersion1PostAESKey(iv, whoAmI.userId)
            if (result === undefined) return makeError(i18n.t('service_not_share_target'))
            aesKeyEncrypted.push(result)
        } else if (version === -39 || version === -38) {
            const keys = await Gun2.queryPostKeysOnGun2(version, iv, minePublic, authorNetworkWorker.val.gunNetworkHint)
            aesKeyEncrypted.push(...keys)
        }
        // If we can decrypt with current info, just do it.
        try {
            // ! Do not remove the await here.
            return await decryptWith(aesKeyEncrypted)
        } catch (error) {
            if (error instanceof Error && error.message === i18n.t('service_not_share_target')) {
                console.debug(error)
                // TODO: Replace this error with:
                // You do not have the necessary private key to decrypt this message.
                // What to do next: You can ask your friend to visit your profile page, so that their Mask extension will detect and add you to recipients.
                // ? after the auto-share with friends is done.
                yield makeError(error)
            } else {
                return handleDOMException(error)
            }
        }

        // Failed, we have to wait for the future info from gun.
        if (version === -40) return makeError(i18n.t('service_not_share_target'))
        const subscription = Gun2Subscribe.subscribePostKeysOnGun2(
            version,
            iv,
            minePublic,
            authorNetworkWorker.val.gunNetworkHint,
        )
        GunWorker?.onTerminated(() => subscription.return?.())
        for await (const aes of subscription) {
            console.log('New key received, trying', aes)
            try {
                return await decryptWith(aes)
            } catch (error) {
                console.debug(error)
            }
        }
        return makeError(i18n.t('service_not_share_target'))

        async function decryptWith(
            key:
                | Alpha39.PublishedAESKey
                | Alpha40.PublishedAESKey
                | Array<Alpha39.PublishedAESKey | Alpha40.PublishedAESKey>,
        ): Promise<Success> {
            const [contentArrayBuffer, postAESKey] = await cryptoProvider.decryptMessage1ToNByOther({
                version,
                AESKeyEncrypted: key,
                authorsPublicKeyECDH: authorPersona.publicKey,
                encryptedContent: encryptedText,
                privateKeyECDH: minePrivate!,
                iv,
            })

            // Store the key to speed up next time decrypt
            setPostCache(postAESKey)
            const content = decodeText(contentArrayBuffer)
            return makeSuccessResult(content, ['normal_decrypted'])
        }

        async function decryptAsAuthor(authorIdentifier: ProfileIdentifier) {
            const localKey = sharePublic ? publicSharedAESKey : await queryLocalKey(authorIdentifier)
            if (!localKey) throw new Error(`Local key for identity ${authorIdentifier.toText()} not found`)
            const [contentArrayBuffer, postAESKey] = await cryptoProvider.decryptMessage1ToNByMyself({
                version,
                encryptedAESKey: ownersAESKeyEncrypted,
                encryptedContent: encryptedText,
                myLocalKey: localKey,
                iv,
            })
            // Store the key to speed up next time decrypt
            setPostCache(postAESKey)
            const content = decodeText(contentArrayBuffer)
            return makeSuccessResult(content, ['normal_decrypted'])
        }
    }
    return makeError(i18n.t('service_unknown_payload'))
}

async function* decryptFromImageUrlWithProgress_raw(
    url: string,
    author: ProfileIdentifier,
    authorNetworkHint: string,
    whoAmI: ProfileIdentifier,
    discoverURL: string | undefined,
): ReturnOfDecryptPostContentWithProgress {
    if (successDecryptionCache.has(url)) return successDecryptionCache.get(url)!
    yield makeProgress('decode_post', true)
    const post = await steganographyDecodeImageUrl(url, {
        pass: author.toText(),
    })
    if (!post.startsWith('🎼') && !/https:\/\/.+\..+\/(\?PostData_v\d=)?%20(.+)%40/.test(post))
        return makeError(i18n.t('service_decode_image_payload_failed'), true)
    const worker = await Result.wrapAsync(() => getNetworkWorker(author))
    if (worker.err) return makeError(worker.val as Error)
    const payload = deconstructPayload(post, await decodeTextPayloadWorker(author))
    if (payload.err) return makeError(payload.val)
    return yield* decryptFromText(payload.val, author, authorNetworkHint, whoAmI, discoverURL)
}

export const decryptFromText = memorizeAsyncGenerator(
    decryptFromPayloadWithProgress_raw,
    (encrypted, author, _, whoAmI) =>
        JSON.stringify([encrypted.iv, encrypted.encryptedText, author.toText(), whoAmI.toText()]),
    1000 * 30,
)

export const decryptFromImageUrl = memorizeAsyncGenerator(
    decryptFromImageUrlWithProgress_raw,
    (url, author, _, whoAmI) => JSON.stringify([url, author.toText(), whoAmI.toText()]),
    1000 * 30,
)

function handleDOMException(e: unknown) {
    if (e instanceof DOMException) {
        return makeError(i18n.t('service_decryption_failed'))
    } else throw e
}
async function* findAuthorPublicKey(
    by: ProfileIdentifier,
    hasCache: boolean,
    maxIteration = 10,
): AsyncGenerator<Progress, 'out of chance' | 'use cache' | PersonaRecord, unknown> {
    let author = await queryPersonaRecord(by)
    let iterations = 0
    while (!author?.publicKey) {
        iterations += 1
        if (iterations < maxIteration) yield makeProgress('finding_person_public_key')
        else return 'out of chance' as const

        author = await queryPersonaRecord(by).catch(() => null)

        if (!author?.publicKey) {
            if (hasCache) return 'use cache' as const
            const abort = new AbortController()
            const databasePromise = new Promise<void>((resolve, reject) => {
                abort.signal.addEventListener('abort', () => {
                    undo()
                    reject()
                })
                const undo = MaskMessages.events.profilesChanged.on((data) => {
                    for (const x of data) {
                        if (x.reason === 'delete') continue
                        if (x.of.equals(by)) {
                            undo()
                            resolve()
                            break
                        }
                    }
                })
            })
            await Promise.race([databasePromise])
                .then(() => abort.abort())
                .catch(() => null)
        }
    }
    if (author?.publicKey) return author
    return 'out of chance'
}

async function decryptFromCache(postPayload: Payload, by: ProfileIdentifier, discoverURL: string | undefined) {
    const { encryptedText, iv, version } = postPayload
    const cryptoProvider = version === -40 ? Alpha40 : Alpha39

    const postIdentifier = new PostIVIdentifier(by.network, iv)
    const cachedKey = await queryPostDB(postIdentifier)
    if (cachedKey && !cachedKey.url && discoverURL) {
        await updatePostDB({ identifier: postIdentifier, url: discoverURL }, 'append')
    }
    const setCache = (postAESKey: AESJsonWebKey) => {
        const postUpdate: Partial<PostRecord> & Pick<PostRecord, 'identifier'> = {
            identifier: postIdentifier,
            postCryptoKey: postAESKey,
            postBy: by,
        }
        if (discoverURL) postUpdate.url = discoverURL
        updatePostDB(postUpdate, 'append')
    }
    if (cachedKey?.postCryptoKey) {
        try {
            const result = decodeText(
                await cryptoProvider.decryptWithAES({
                    aesKey: cachedKey.postCryptoKey,
                    encrypted: encryptedText,
                    iv: iv,
                }),
            )
            return [result, setCache] as const
        } catch {}
    }
    return [undefined, setCache] as const
}
