import * as Alpha40 from '../../../crypto/crypto-alpha-40'
import * as Alpha39 from '../../../crypto/crypto-alpha-39'
import * as Gun1 from '../../../network/gun/version.1'
import * as Gun2 from '../../../network/gun/version.2'
import { decodeText } from '../../../utils/type-transform/String-ArrayBuffer'
import { deconstructPayload } from '../../../utils/type-transform/Payload'
import { geti18nString } from '../../../utils/i18n'
import { getMyPrivateKey } from '../../../database'
import { queryPersonDB, queryLocalKeyDB } from '../../../database/people'
import { PersonIdentifier, PostIdentifier } from '../../../database/type'
import { queryPostDB, updatePostDB } from '../../../database/post'
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
    if (data.version === -40) {
        const { encryptedText, iv: salt, ownersAESKeyEncrypted, signature, version } = data
        const postIdentifier = new PostIdentifier(by, salt.replace(/\//g, '|'))
        const unverified = ['2/4', ownersAESKeyEncrypted, salt, encryptedText].join('|')
        {
            const cachedKey = await queryPostDB(postIdentifier)
            if (cachedKey && cachedKey.postCryptoKey) {
                return {
                    content: decodeText(
                        await Alpha40.decryptWithAES({
                            aesKey: cachedKey.postCryptoKey,
                            encrypted: encryptedText,
                            iv: salt,
                        }),
                    ),
                    // ! TODO: verify the message again
                    signatureVerifyResult: true,
                }
            }
        }
        async function getKey(user: PersonIdentifier) {
            let person = await queryPersonDB(by)
            try {
                if (!person || !person.publicKey) await Gun1.addPersonPublicKey(user)
                person = (await queryPersonDB(by))!
            } catch {
                return null
            }
            return person.publicKey
        }
        const byKey = await getKey(by)
        if (!byKey) return { error: geti18nString('service_others_key_not_found', by.userId) }
        const mine = await getMyPrivateKey(whoAmI)
        if (!mine) return { error: geti18nString('service_not_setup_yet') }
        try {
            if (by.equals(whoAmI)) {
                const [contentArrayBuffer, postAESKey] = await Alpha40.decryptMessage1ToNByMyself({
                    version: -40,
                    encryptedAESKey: ownersAESKeyEncrypted,
                    encryptedContent: encryptedText,
                    myLocalKey: (await queryLocalKeyDB(whoAmI))!,
                    iv: salt,
                })
                const content = decodeText(contentArrayBuffer)
                try {
                    if (!signature) throw new TypeError('No signature')
                    const signatureVerifyResult = await Alpha40.verify(unverified, signature, mine.publicKey)
                    // Store the key to speed up next time decrypt
                    signatureVerifyResult &&
                        updatePostDB(
                            {
                                identifier: postIdentifier,
                                postCryptoKey: postAESKey,
                                version: -40,
                            },
                            'append',
                        )
                    return { signatureVerifyResult, content }
                } catch {
                    return { signatureVerifyResult: false, content }
                }
            } else {
                const aesKeyEncrypted = await Gun1.queryPostAESKey(salt, whoAmI.userId)
                // TODO: Replace this error with:
                // You do not have the necessary private key to decrypt this message.
                // What to do next: You can ask your friend to visit your profile page, so that their Maskbook extension will detect and add you to recipients.
                // ? after the auto-share with friends is done.
                if (aesKeyEncrypted === undefined) {
                    return {
                        error: geti18nString('service_not_share_target'),
                    }
                }
                const [contentArrayBuffer, postAESKey] = await Alpha40.decryptMessage1ToNByOther({
                    version: -40,
                    AESKeyEncrypted: aesKeyEncrypted,
                    authorsPublicKeyECDH: byKey,
                    encryptedContent: encryptedText,
                    privateKeyECDH: mine.privateKey,
                    iv: salt,
                })
                const content = decodeText(contentArrayBuffer)
                try {
                    if (!signature) throw new TypeError('No signature')
                    const signatureVerifyResult = await Alpha40.verify(unverified, signature, byKey)
                    // Store the key to speed up next time decrypt
                    signatureVerifyResult &&
                        updatePostDB(
                            {
                                identifier: postIdentifier,
                                postCryptoKey: postAESKey,
                                version: -40,
                            },
                            'append',
                        )
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
