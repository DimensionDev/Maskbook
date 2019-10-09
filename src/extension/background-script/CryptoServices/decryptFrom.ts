import * as Alpha40 from '../../../crypto/crypto-alpha-40'
import * as Alpha39 from '../../../crypto/crypto-alpha-39'
import * as Gun1 from '../../../network/gun/version.1'
import * as Gun2 from '../../../network/gun/version.2'
import { decodeText } from '../../../utils/type-transform/String-ArrayBuffer'
import { deconstructPayload, Payload } from '../../../utils/type-transform/Payload'
import { geti18nString } from '../../../utils/i18n'
import { getMyPrivateKey } from '../../../database'
import { queryLocalKeyDB, queryPersonDB } from '../../../database/people'
import { PersonIdentifier, PostIVIdentifier } from '../../../database/type'
import { queryPostDB, updatePostDB } from '../../../database/post'
import { addPerson } from './addPerson'
import { MessageCenter } from '../../../utils/messages'
type Progress = {
    progress: 'finding_person_public_key' | 'finding_post_key'
}
type DebugInfo = {
    debug: 'debug_finding_hash'
    hash: [string, string]
}
type Success = {
    signatureVerifyResult: boolean
    content: string
    through: ('author_key_not_found' | 'my_key_not_found' | 'post_key_cached' | 'normal_decrypted')[]
}
type Failure = {
    error: string
}
export type SuccessDecryption = Success
export type FailureDecryption = Failure
export type DecryptionProgress = Progress
type ReturnOfDecryptFromMessageWithProgress = AsyncIterator<Failure | Progress | DebugInfo, Success | Failure, void> & {
    [Symbol.asyncIterator](): AsyncIterator<Failure | Progress | DebugInfo, Success | Failure, void>
}

/**
 * Decrypt message from a user
 * @param encrypted post
 * @param by Post by
 * @param whoAmI My username
 */
export async function* decryptFromMessageWithProgress(
    encrypted: string,
    by: PersonIdentifier,
    whoAmI: PersonIdentifier,
): ReturnOfDecryptFromMessageWithProgress {
    // If any of parameters is changed, we will not handle it.
    const data = deconstructPayload(encrypted)!
    if (!data) {
        try {
            deconstructPayload(encrypted, true)
        } catch (e) {
            return { error: e.message }
        }
    }
    const version = data.version
    if (version === -40 || version === -39) {
        const { encryptedText, iv, ownersAESKeyEncrypted, signature, version } = data
        const unverified = [version === -40 ? '2/4' : '3/4', ownersAESKeyEncrypted, iv, encryptedText].join('|')
        const cryptoProvider = version === -40 ? Alpha40 : Alpha39

        const [cachedPostResult, setPostCache] = await decryptFromCache(data, by)

        let byPerson = await queryPersonDB(by)
        let iterations = 0
        while (byPerson === null || !byPerson.publicKey) {
            iterations += 1
            if (iterations < 10) yield { progress: 'finding_person_public_key' }
            else return { error: geti18nString('service_others_key_not_found', by.userId) }
            byPerson = await addPerson(by).catch(() => null)

            if (!byPerson || !byPerson.publicKey) {
                if (cachedPostResult)
                    return {
                        signatureVerifyResult: false,
                        content: cachedPostResult,
                        through: ['author_key_not_found', 'post_key_cached'],
                    } as Success
                let rejectGun = () => {}
                let rejectDatabase = () => {}
                const awaitGun = new Promise((resolve, reject) => {
                    rejectGun = () => {
                        undo()
                        reject()
                    }
                    const undo = Gun2.subscribePersonFromGun2(by, data => {
                        if (data && (data.provePostId || '').length > 0) {
                            undo()
                            resolve()
                        }
                    })
                })
                const awaitDatabase = new Promise((resolve, reject) => {
                    const undo = MessageCenter.on('newPerson', data => {
                        if (data.identifier.equals(by)) {
                            undo()
                            resolve()
                        }
                    })
                    rejectDatabase = () => {
                        undo()
                        reject()
                    }
                })
                await Promise.race([awaitGun, awaitDatabase])
                    .then(() => {
                        rejectDatabase()
                        rejectGun()
                    })
                    .catch(() => null)
            }
        }

        const mine = await getMyPrivateKey(whoAmI)
        if (!mine) {
            if (cachedPostResult)
                return {
                    signatureVerifyResult: false,
                    content: cachedPostResult,
                    through: ['my_key_not_found', 'post_key_cached'],
                } as Success
            return { error: geti18nString('service_not_setup_yet') }
        }

        try {
            if (by.equals(whoAmI)) {
                if (cachedPostResult)
                    return {
                        signatureVerifyResult: await cryptoProvider.verify(unverified, signature || '', mine.publicKey),
                        content: cachedPostResult,
                        through: ['post_key_cached'],
                    } as Success

                const [contentArrayBuffer, postAESKey] = await cryptoProvider.decryptMessage1ToNByMyself({
                    version,
                    encryptedAESKey: ownersAESKeyEncrypted,
                    encryptedContent: encryptedText,
                    myLocalKey: (await queryLocalKeyDB(whoAmI))!,
                    iv,
                })
                // Store the key to speed up next time decrypt
                setPostCache(postAESKey)
                const content = decodeText(contentArrayBuffer)
                try {
                    if (!signature) throw new Error()
                    const signatureVerifyResult = await cryptoProvider.verify(unverified, signature, mine.publicKey)
                    return { signatureVerifyResult, content, through: ['normal_decrypted'] } as Success
                } catch {
                    return { signatureVerifyResult: false, content, through: ['normal_decrypted'] } as Success
                }
            } else {
                if (cachedPostResult) {
                    const { keyHash, postHash } = await Gun2.queryPostKeysOnGun2(-39, iv, mine.publicKey)
                    yield { debug: 'debug_finding_hash', hash: [postHash, keyHash] }
                    return {
                        signatureVerifyResult: await cryptoProvider.verify(
                            unverified,
                            signature || '',
                            byPerson.publicKey,
                        ),
                        content: cachedPostResult,
                        through: ['post_key_cached'],
                    } as Success
                }
                yield { progress: 'finding_post_key' }
                const aesKeyEncrypted: Array<Alpha40.PublishedAESKey | Gun2.SharedAESKeyGun2> = []
                if (version === -40) {
                    // Deprecated payload
                    // eslint-disable-next-line import/no-deprecated
                    const result = await Gun1.queryPostAESKey(iv, whoAmI.userId)
                    if (result === undefined) return { error: geti18nString('service_not_share_target') }
                    aesKeyEncrypted.push(result)
                } else if (version === -39) {
                    const { keyHash, keys, postHash } = await Gun2.queryPostKeysOnGun2(-39, iv, mine.publicKey)
                    yield { debug: 'debug_finding_hash', hash: [postHash, keyHash] }
                    aesKeyEncrypted.push(...keys)
                }

                // If we can decrypt with current info, just do it.
                try {
                    // ! DO NOT remove the await here. Or the catch block will be always skipped.
                    return await decryptWith(aesKeyEncrypted)
                } catch (e) {
                    if (e.message === geti18nString('service_not_share_target')) {
                        console.debug(e)
                        // TODO: Replace this error with:
                        // You do not have the necessary private key to decrypt this message.
                        // What to do next: You can ask your friend to visit your profile page, so that their Maskbook extension will detect and add you to recipients.
                        // ? after the auto-share with friends is done.
                        yield { error: geti18nString('service_not_share_target') } as Failure
                    } else {
                        // Unknown error
                        throw e
                    }
                }

                // Failed, we have to wait for the future info from gun.
                return new Promise<Success>((resolve, reject) => {
                    const undo = Gun2.subscribePostKeysOnGun2(-39, iv, mine.publicKey, async key => {
                        console.log('New key received, trying', key)
                        try {
                            const result = await decryptWith(key)
                            undo()
                            resolve(result)
                        } catch (e) {
                            console.debug(e)
                        }
                    })
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
                        authorsPublicKeyECDH: byPerson!.publicKey!,
                        encryptedContent: encryptedText,
                        privateKeyECDH: mine!.privateKey,
                        iv,
                    })

                    // Store the key to speed up next time decrypt
                    setPostCache(postAESKey)
                    const content = decodeText(contentArrayBuffer)
                    try {
                        if (!signature) throw new TypeError('No signature')
                        const signatureVerifyResult = await cryptoProvider.verify(
                            unverified,
                            signature,
                            byPerson!.publicKey!,
                        )
                        return { signatureVerifyResult, content, through: ['normal_decrypted'] }
                    } catch {
                        return { signatureVerifyResult: false, content, through: ['normal_decrypted'] }
                    }
                }
            }
        } catch (e) {
            if (e instanceof DOMException) {
                console.error(e)
                return { error: geti18nString('service_decryption_failed') }
            } else throw e
        }
    }
    return { error: geti18nString('service_unknown_payload') }
}

export async function decryptFrom(
    ...args: Parameters<typeof decryptFromMessageWithProgress>
): Promise<Success | Failure> {
    const iter = decryptFromMessageWithProgress(...args)
    let yielded = await iter.next()
    while (!yielded.done) {
        yielded = await iter.next()
    }
    return yielded.value
}

async function decryptFromCache(postPayload: Payload, by: PersonIdentifier) {
    const { encryptedText, iv, version } = postPayload
    const cryptoProvider = version === -40 ? Alpha40 : Alpha39

    const postIdentifier = new PostIVIdentifier(by.network, iv)
    const cachedKey = await queryPostDB(postIdentifier)
    const setCache = (postAESKey: CryptoKey) => {
        updatePostDB(
            {
                identifier: postIdentifier,
                postCryptoKey: postAESKey,
                version,
            },
            'append',
        )
    }
    if (cachedKey && cachedKey.postCryptoKey) {
        const result = decodeText(
            await cryptoProvider.decryptWithAES({
                aesKey: cachedKey.postCryptoKey,
                encrypted: encryptedText,
                iv: iv,
            }),
        )
        return [result, setCache] as const
    }
    return [undefined, setCache] as const
}
