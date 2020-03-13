import * as Alpha38 from '../../../crypto/crypto-alpha-38'
import * as Gun2 from '../../../network/gun/version.2'
import { encodeArrayBuffer } from '../../../utils/type-transform/String-ArrayBuffer'
import { constructAlpha38, PayloadLatest } from '../../../utils/type-transform/Payload'
import { Group, queryPrivateKey, queryLocalKey } from '../../../database'
import { ProfileIdentifier, PostIVIdentifier, GroupIdentifier, Identifier } from '../../../database/type'
import { prepareOthersKeyForEncryptionV39OrV38 } from './prepareOthersKeyForEncryption'
import { getNetworkWorker } from '../../../social-network/worker'
import { getSignablePayload, TypedMessage, cryptoProviderTable } from './utils'
import { createPostDB, PostRecord, RecipientReason } from '../../../database/post'
import { queryUserGroup } from '../UserGroupService'
import { queryPersonaByProfileDB } from '../../../database/Persona/Persona.db'
import { compressSecp256k1Key } from '../../../utils/type-transform/SECP256k1-Compression'
import { import_AES_GCM_256_Key } from '../../../utils/crypto.subtle'
import { i18n } from '../../../utils/i18n-next'
import { IdentifierMap } from '../../../database/IdentifierMap'

type EncryptedText = string
type OthersAESKeyEncryptedToken = string
/**
 * This map stores <iv, [networkHint, othersAESKeyEncrypted]>.
 */
const OthersAESKeyEncryptedMap = new Map<
    OthersAESKeyEncryptedToken,
    [string, Alpha38.PublishedAESKeyRecordV39OrV38[]]
>()

/**
 * Encrypt to a user
 * @param content       Original text
 * @param to            Encrypt target
 * @param whoAmI        Encrypt source
 * @returns Will return a tuple of [encrypted: string, token: string] where
 * - `encrypted` is the encrypted string
 * - `token` is used to call `publishPostAESKey` before post the content
 */
export async function encryptTo(
    content: TypedMessage,
    to: (ProfileIdentifier | GroupIdentifier)[],
    whoAmI: ProfileIdentifier,
    publicShared: boolean,
): Promise<[EncryptedText, OthersAESKeyEncryptedToken]> {
    if (to.length === 0 && publicShared === false) return ['', '']
    if (publicShared) to = []

    const recipients: PostRecord['recipients'] = new IdentifierMap(new Map(), ProfileIdentifier)
    function addRecipients(x: ProfileIdentifier, reason: RecipientReason) {
        const id = x
        if (recipients.has(id)) recipients.get(id)!.reason.push(reason)
        // TODO:
        else recipients.set(id, { reason: [reason], published: true })
    }
    const sharedGroups = new Set<Group>()
    for (const i of to) {
        if (i instanceof ProfileIdentifier) addRecipients(i, { type: 'direct', at: new Date() })
        // TODO: Should we throw if there the group is not find?
        else sharedGroups.add((await queryUserGroup(i))!)
    }
    for (const group of sharedGroups) {
        for (const each of group.members) {
            addRecipients(each, { at: new Date(), type: 'group', group: group.identifier })
        }
    }

    const toKey = await prepareOthersKeyForEncryptionV39OrV38(
        Object.keys(recipients)
            .map(x => Identifier.fromString(x, ProfileIdentifier))
            .filter(x => x.ok)
            .map(x => x.val as ProfileIdentifier),
    )
    const minePrivateKey = await queryPrivateKey(whoAmI)
    if (!minePrivateKey) throw new TypeError('Not inited yet')
    const stringifiedContent = Alpha38.typedMessageStringify(content)
    const localKey = publicShared
        ? await import_AES_GCM_256_Key(Alpha38.publicSharedAESKey)
        : (await queryLocalKey(whoAmI))!
    const {
        encryptedContent: encryptedText,
        othersAESKeyEncrypted,
        ownersAESKeyEncrypted,
        iv,
        postAESKey,
    } = await Alpha38.encrypt1ToN({
        version: -38,
        content: stringifiedContent,
        othersPublicKeyECDH: Array.from(toKey.values()),
        ownersLocalKey: localKey,
        privateKeyECDH: minePrivateKey,
        iv: crypto.getRandomValues(new Uint8Array(16)),
    })

    const payload: PayloadLatest = {
        AESKeyEncrypted: encodeArrayBuffer(ownersAESKeyEncrypted),
        encryptedText: encodeArrayBuffer(encryptedText),
        iv: encodeArrayBuffer(iv),
        signature: '',
        sharedPublic: publicShared,
        version: -38,
    }
    try {
        const publicKey = (await queryPersonaByProfileDB(whoAmI))?.publicKey
        if (publicKey) payload.authorPublicKey = compressSecp256k1Key(publicKey, 'public')
    } catch (e) {}

    const payloadWaitToSign = getSignablePayload(payload)
    payload.signature = encodeArrayBuffer(await Alpha38.sign(payloadWaitToSign, minePrivateKey))

    await createPostDB({
        identifier: new PostIVIdentifier(whoAmI.network, payload.iv),
        postBy: whoAmI,
        postCryptoKey: postAESKey,
        recipients: recipients,
        foundAt: new Date(),
        recipientGroups: to.filter(x => x instanceof GroupIdentifier) as GroupIdentifier[],
    })

    const postAESKeyToken = encodeArrayBuffer(iv)
    OthersAESKeyEncryptedMap.set(postAESKeyToken, [getNetworkWorker(whoAmI).gunNetworkHint, othersAESKeyEncrypted])
    return [constructAlpha38(payload, getNetworkWorker(whoAmI.network).payloadEncoder), postAESKeyToken]
}

/**
 * MUST call before send post, or othersAESKeyEncrypted will not be published to the internet!
 * TODO: If we can use PostIVIdentifier to avoid this hacking way to publish PostAESKey?
 * @param iv Token that returns in the encryptTo
 */
export async function publishPostAESKey(iv: string) {
    if (!OthersAESKeyEncryptedMap.has(iv)) throw new Error(i18n.t('service_publish_post_aes_key_failed'))
    // Use the latest payload version here since we do not accept new post for older version.
    return Gun2.publishPostAESKeyOnGun2(-38, iv, ...OthersAESKeyEncryptedMap.get(iv)!)
}
