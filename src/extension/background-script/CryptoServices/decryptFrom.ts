import * as Alpha40 from '../../../crypto/crypto-alpha-40'
import * as Alpha39 from '../../../crypto/crypto-alpha-39'
import * as Gun1 from '../../../network/gun/version.1'
import * as Gun2 from '../../../network/gun/version.2'
import { decodeText } from '../../../utils/type-transform/String-ArrayBuffer'
import { deconstructPayload, Payload } from '../../../utils/type-transform/Payload'
import { i18n } from '../../../utils/i18n-next'
import { queryPersonaRecord, queryLocalKey } from '../../../database'
import { ProfileIdentifier, PostIVIdentifier } from '../../../database/type'
import { queryPostDB, updatePostDB } from '../../../database/post'
import { addPerson } from './addPerson'
import { MessageCenter } from '../../../utils/messages'
import { getNetworkWorker } from '../../../social-network/worker'
import { getSignablePayload, TypedMessage } from './utils'
import { cryptoProviderTable } from './cryptoProviderTable'
import type { PersonaRecord } from '../../../database/Persona/Persona.db'
import { verifyOthersProve } from './verifyOthersProve'
import { publicSharedAESKey } from '../../../crypto/crypto-alpha-38'
import { DecryptFailedReason } from '../../../utils/constants'
import { asyncIteratorWithResult, memorizeAsyncGenerator } from '../../../utils/type-transform/asyncIteratorHelpers'
import { sleep } from '@holoflows/kit/es/util/sleep'
import type { EC_Public_JsonWebKey, AESJsonWebKey } from '../../../modules/CryptoAlgorithm/interfaces/utils'
import type { PostInfoImageAttachment, PostInfoTextAttachment } from '../../../social-network/PostInfo'
import { decodeImageUrl } from '../SteganographyService'

type Progress =
    | { type: 'progress'; progress: 'finding_person_public_key' | 'finding_post_key' | 'init' }
    | { type: 'progress'; progress: 'intermediate_success'; data: Success }
type DebugInfo = {
    debug: 'debug_finding_hash'
    hash: [string, string]
    type: 'debug'
}
type SuccessSignatureVerifyResult = boolean | 'verifying'
type SuccessThrough = 'author_key_not_found' | 'post_key_cached' | 'normal_decrypted'
type Success = {
    type: 'success'
    signatureVerifyResult: SuccessSignatureVerifyResult
    content: TypedMessage
    rawContent: string
    through: SuccessThrough[]
}
type Failure = {
    error: string
    type: 'error'
}
export type SuccessDecryption = Success
export type FailureDecryption = Failure
export type DecryptionProgress = Progress
type ReturnOfDecryptPostContentWithProgress = AsyncGenerator<Failure | Progress | DebugInfo, Success | Failure, void>

const successDecryptionCache = new Map<string, Success>()
const makeSuccessResultF = (
    key: string,
    cryptoProvider: typeof cryptoProviderTable[keyof typeof cryptoProviderTable],
) => (
    rawEncryptedContent: string,
    through: Success['through'],
    signatureVerifyResult: Success['signatureVerifyResult'] = true,
): Success => {
    const success: Success = {
        signatureVerifyResult,
        rawContent: rawEncryptedContent,
        through,
        content: cryptoProvider.typedMessageParse(rawEncryptedContent),
        type: 'success',
    }
    successDecryptionCache.set(key, success)
    return success
}

function makeProgress(progress: Exclude<Progress['progress'], 'intermediate_success'> | Success): Progress {
    if (typeof progress === 'string') return { type: 'progress', progress }
    return { type: 'progress', progress: 'intermediate_success', data: progress }
}
function makeError(error: string | Error): Failure {
    if (typeof error === 'string') return { type: 'error', error }
    return makeError(error.message)
}
/**
 * Decrypt message from a user
 * @param post post
 * @param author Post by
 * @param whoAmI My username
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
async function* decryptFromTextWithProgress_raw(
    attachment: PostInfoTextAttachment,
    author: ProfileIdentifier,
    whoAmI: ProfileIdentifier,
    publicShared: boolean,
): ReturnOfDecryptPostContentWithProgress {
    const post = attachment.content
    if (successDecryptionCache.has(post)) return successDecryptionCache.get(post)!
    yield makeProgress('init')

    const authorNetworkWorker = getNetworkWorker(author.network)
    if (authorNetworkWorker.err) return makeError(authorNetworkWorker.val)
    const decodeResult = deconstructPayload(post, authorNetworkWorker.val.payloadDecoder)
    if (decodeResult.err) return makeError(decodeResult.val)
    const data = decodeResult.val
    const { version } = data

    if (version === -40 || version === -39 || version === -38) {
        const { encryptedText, iv, signature, version } = data
        const cryptoProvider = cryptoProviderTable[version]
        const makeSuccessResult = makeSuccessResultF(post, cryptoProvider)
        const ownersAESKeyEncrypted = data.version === -38 ? data.AESKeyEncrypted : data.ownersAESKeyEncrypted
        const waitForVerifySignaturePayload = getSignablePayload(data)

        // ? Early emit the cache.
        const [cachedPostResult, setPostCache] = await decryptFromCache(data, author)
        if (cachedPostResult) {
            yield makeProgress(makeSuccessResult(cachedPostResult, ['post_key_cached'], 'verifying'))
        }

        // ? If the author's key is in the payload, store it.
        if (data.version === -38 && data.authorPublicKey) {
            await verifyOthersProve({ raw: data.authorPublicKey }, author).catch(console.error)
        }
        // ? Find author's public key.
        let authorPersona!: PersonaRecord
        for await (const _ of asyncIteratorWithResult(findAuthorPublicKey(author, !!cachedPostResult))) {
            if (!_.done) {
                yield _.value
                continue
            }
            const result = _.value
            if (result === 'out of chance')
                return makeError(i18n.t('service_others_key_not_found', { name: author.userId }))
            else if (result === 'use cache')
                return makeSuccessResult(cachedPostResult!, ['author_key_not_found', 'post_key_cached'], false)
            else authorPersona = result
        }

        // ? Get my public & private key.
        const queryWhoAmI = () => queryPersonaRecord(whoAmI)
        const mine = await queryWhoAmI().then((x) => x || sleep(1000).then(queryWhoAmI))
        if (!mine?.privateKey) return makeError(DecryptFailedReason.MyCryptoKeyNotFound)

        const { publicKey: minePublic, privateKey: minePrivate } = mine
        if (cachedPostResult) {
            if (!author.equals(whoAmI) && minePrivate && version !== -40) {
                const { keyHash, postHash } = await Gun2.queryPostKeysOnGun2(
                    version,
                    iv,
                    minePublic,
                    getNetworkWorker(whoAmI).unwrap().gunNetworkHint,
                )
                yield { type: 'debug', debug: 'debug_finding_hash', hash: [postHash, keyHash] }
            }
            const signatureVerifyResult = authorPersona.publicKey
                ? await cryptoProvider.verify(waitForVerifySignaturePayload, signature || '', authorPersona.publicKey)
                : false
            return makeSuccessResult(cachedPostResult, ['post_key_cached'], signatureVerifyResult)
        }

        let lastError: unknown
        /**
         * ? try to decrypt as I am the author
         * ? then try to decrypt as whoAmI
         * ? then try to go through a normal decrypt process
         */
        try {
            const a = decryptAsAuthor(author, minePublic)
            const b = decryptAsAuthor(whoAmI, minePublic)
            // ! Don't remove the await
            return await a.catch(() => b)
        } catch (e) {
            lastError = e
        }

        if (author.equals(whoAmI)) {
            // if the decryption process goes here,
            // that means it is failed to decrypt by local identities.
            // If remove this if block, Maskbook will search the key
            // for the post even that post by myself.
            if (lastError instanceof DOMException) return handleDOMException(lastError)
            console.error(lastError)
            return makeError(i18n.t('service_self_key_decryption_failed'))
        }

        yield makeProgress('finding_post_key')
        const aesKeyEncrypted: Array<Alpha40.PublishedAESKey | Gun2.SharedAESKeyGun2> = []
        if (version === -40) {
            // Deprecated payload
            // eslint-disable-next-line import/no-deprecated
            const result = await Gun1.queryPostAESKey(iv, whoAmI.userId)
            if (result === undefined) return makeError(i18n.t('service_not_share_target'))
            aesKeyEncrypted.push(result)
        } else if (version === -39 || version === -38) {
            const { keyHash, keys, postHash } = await Gun2.queryPostKeysOnGun2(
                version,
                iv,
                minePublic,
                authorNetworkWorker.val.gunNetworkHint,
            )
            yield { type: 'debug', debug: 'debug_finding_hash', hash: [postHash, keyHash] }
            aesKeyEncrypted.push(...keys)
        }
        // If we can decrypt with current info, just do it.
        try {
            // ! Do not remove the await here.
            return await decryptWith(aesKeyEncrypted)
        } catch (e) {
            if (e.message === i18n.t('service_not_share_target')) {
                console.debug(e)
                // TODO: Replace this error with:
                // You do not have the necessary private key to decrypt this message.
                // What to do next: You can ask your friend to visit your profile page, so that their Maskbook extension will detect and add you to recipients.
                // ? after the auto-share with friends is done.
                yield makeError(e)
            } else {
                return handleDOMException(e)
            }
        }

        // Failed, we have to wait for the future info from gun.
        return new Promise<Success>((resolve, reject) => {
            if (version === -40) return reject()
            const undo = Gun2.subscribePostKeysOnGun2(
                version,
                iv,
                minePublic,
                authorNetworkWorker.val.gunNetworkHint,
                async (key) => {
                    console.log('New key received, trying', key)
                    try {
                        const result = await decryptWith(key)
                        undo()
                        resolve(result)
                    } catch (e) {
                        console.debug(e)
                    }
                },
            )
        })

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
            try {
                if (!signature) throw new TypeError('No signature')
                const signatureVerifyResult = await cryptoProvider.verify(
                    waitForVerifySignaturePayload,
                    signature,
                    authorPersona.publicKey,
                )
                return makeSuccessResult(content, ['normal_decrypted'], signatureVerifyResult)
            } catch {
                return makeSuccessResult(content, ['normal_decrypted'], false)
            }
        }

        async function decryptAsAuthor(authorIdentifier: ProfileIdentifier, authorPublic: EC_Public_JsonWebKey) {
            const localKey = publicShared ? publicSharedAESKey : await queryLocalKey(authorIdentifier)
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
            const signatureVerifyResult = await cryptoProvider.verify(
                waitForVerifySignaturePayload,
                signature || '',
                authorPublic,
            )
            return makeSuccessResult(content, ['normal_decrypted'], signatureVerifyResult)
        }
    }
    return makeError(i18n.t('service_unknown_payload'))
}

async function* decryptFromImageWithProgress_raw(
    attachment: PostInfoImageAttachment,
    author: ProfileIdentifier,
    whoAmI: ProfileIdentifier,
    publicShared: boolean,
): ReturnOfDecryptPostContentWithProgress {
    if (successDecryptionCache.has(attachment.url)) return successDecryptionCache.get(attachment.url)!
    yield makeProgress('init')
    const post = await decodeImageUrl(attachment.url, {
        pass: author.toText(),
    })
    if (post.indexOf('🎼') !== 0 && !/https:\/\/.+\..+\/(\?PostData_v\d=)?%20(.+)%40/.test(post))
        return makeError(i18n.t('service_decode_image_payload_failed'))
    return yield* decryptFromText(
        {
            type: 'text',
            content: post,
        },
        author,
        whoAmI,
        publicShared,
    )
}

export const decryptFromText = memorizeAsyncGenerator(
    decryptFromTextWithProgress_raw,
    (encrypted, author, whoAmI, publicShared) =>
        JSON.stringify([encrypted, author.toText(), whoAmI.toText(), publicShared]),
    1000 * 30,
)

export const decryptFromImage = memorizeAsyncGenerator(
    decryptFromImageWithProgress_raw,
    ({ url }: PostInfoImageAttachment) => url,
    1000 * 30,
)

function handleDOMException(e: unknown) {
    if (e instanceof DOMException) {
        console.error(e)
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

        author = await addPerson(by).catch(() => null)

        if (!author?.publicKey) {
            if (hasCache) return 'use cache' as const
            const abort = new AbortController()
            const gunPromise = new Promise((resolve, reject) => {
                abort.signal.addEventListener('abort', () => {
                    undo()
                    reject()
                })
                const undo = Gun2.subscribePersonFromGun2(by, (data) => {
                    const provePostID = data?.provePostId as string | '' | undefined
                    if (provePostID?.length ?? 0 > 0) {
                        undo()
                        resolve()
                    }
                })
            })
            const databasePromise = new Promise((resolve, reject) => {
                abort.signal.addEventListener('abort', () => {
                    undo()
                    reject()
                })
                const undo = MessageCenter.on('profilesChanged', (data) => {
                    for (const x of data) {
                        if (x.reason === 'delete') continue
                        if (x.of.identifier.equals(by)) {
                            undo()
                            resolve()
                            break
                        }
                    }
                })
            })
            await Promise.race([gunPromise, databasePromise])
                .then(() => abort.abort())
                .catch(() => null)
        }
    }
    if (author && author.publicKey) return author
    return 'out of chance'
}

async function decryptFromCache(postPayload: Payload, by: ProfileIdentifier) {
    const { encryptedText, iv, version } = postPayload
    const cryptoProvider = version === -40 ? Alpha40 : Alpha39

    const postIdentifier = new PostIVIdentifier(by.network, iv)
    const cachedKey = await queryPostDB(postIdentifier)
    const setCache = (postAESKey: AESJsonWebKey) => {
        updatePostDB(
            {
                identifier: postIdentifier,
                postCryptoKey: postAESKey,
                postBy: by,
            },
            'append',
        )
    }
    if (cachedKey && cachedKey.postCryptoKey) {
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
