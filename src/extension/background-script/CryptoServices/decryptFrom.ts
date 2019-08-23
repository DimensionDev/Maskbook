import * as Alpha40 from '../../../crypto/crypto-alpha-40'
import * as Alpha39 from '../../../crypto/crypto-alpha-39'
import * as Gun1 from '../../../network/gun/version.1'
import * as Gun2 from '../../../network/gun/version.2'
import { decodeText } from '../../../utils/type-transform/String-ArrayBuffer'
import { deconstructPayload, Payload } from '../../../utils/type-transform/Payload'
import { geti18nString } from '../../../utils/i18n'
import { getMyPrivateKey } from '../../../database'
import { queryLocalKeyDB } from '../../../database/people'
import { PersonIdentifier, PostIdentifier, PersonUI } from '../../../database/type'
import { queryPostDB, updatePostDB } from '../../../database/post'
import { addPerson } from './addPerson'
type Success = {
    signatureVerifyResult: boolean
    content: string
}

type Failure = {
    error: string
}

/**
 * Decrypt message from a user
 * @param encrypted post
 * @param by Post by
 * @param whoAmI My username
 */
export async function decryptFrom(
    encrypted: string,
    by: PersonIdentifier,
    whoAmI: PersonIdentifier,
): Promise<Success | Failure> {
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
        const { encryptedText, iv: iv, ownersAESKeyEncrypted, signature, version } = data
        const unverified = [version === -40 ? '2/4' : '3/4', ownersAESKeyEncrypted, iv, encryptedText].join('|')
        const cryptoProvider = version === -40 ? Alpha40 : Alpha39

        const [cachedPostResult, setPostCache] = await decryptFromCache(data, by)

        const byPerson = await addPerson(by).catch(() => null)
        if (!byPerson || !byPerson.publicKey) {
            if (cachedPostResult) return { signatureVerifyResult: false, content: cachedPostResult }
            return { error: geti18nString('service_others_key_not_found', by.userId) }
        }

        const mine = await getMyPrivateKey(whoAmI)
        if (!mine) {
            if (cachedPostResult) return { signatureVerifyResult: false, content: cachedPostResult }
            return { error: geti18nString('service_not_setup_yet') }
        }

        try {
            if (by.equals(whoAmI)) {
                if (cachedPostResult)
                    return {
                        signatureVerifyResult: await cryptoProvider.verify(unverified, signature || '', mine.publicKey),
                        content: cachedPostResult,
                    }

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
                    return { signatureVerifyResult, content }
                } catch {
                    return { signatureVerifyResult: false, content }
                }
            } else {
                if (cachedPostResult)
                    return {
                        signatureVerifyResult: await cryptoProvider.verify(
                            unverified,
                            signature || '',
                            byPerson.publicKey,
                        ),
                        content: cachedPostResult,
                    }
                const aesKeyEncrypted =
                    version === -40
                        ? // eslint-disable-next-line deprecation
                          await Gun1.queryPostAESKey(iv, whoAmI.userId)
                        : await Gun2.queryPostKeysOnGun2(iv, mine.publicKey)

                // TODO: Replace this error with:
                // You do not have the necessary private key to decrypt this message.
                // What to do next: You can ask your friend to visit your profile page, so that their Maskbook extension will detect and add you to recipients.
                // ? after the auto-share with friends is done.
                if (aesKeyEncrypted === undefined) {
                    return {
                        error: geti18nString('service_not_share_target'),
                    }
                }
                const [contentArrayBuffer, postAESKey] = await cryptoProvider.decryptMessage1ToNByOther({
                    version,
                    AESKeyEncrypted: aesKeyEncrypted,
                    authorsPublicKeyECDH: byPerson.publicKey,
                    encryptedContent: encryptedText,
                    privateKeyECDH: mine.privateKey,
                    iv,
                })
                // Store the key to speed up next time decrypt
                setPostCache(postAESKey)
                const content = decodeText(contentArrayBuffer)
                try {
                    if (!signature) throw new TypeError('No signature')
                    const signatureVerifyResult = await cryptoProvider.verify(unverified, signature, byPerson.publicKey)
                    return { signatureVerifyResult, content }
                } catch {
                    return { signatureVerifyResult: false, content }
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
async function decryptFromCache(postPayload: Payload, by: PersonIdentifier) {
    const { encryptedText, iv, version } = postPayload
    const cryptoProvider = version === -40 ? Alpha40 : Alpha39

    const postIdentifier = new PostIdentifier(by, iv.replace(/\//g, '|'))
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
