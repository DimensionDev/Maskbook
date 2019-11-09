import * as Alpha38 from '../../../crypto/crypto-alpha-38'
import * as Gun2 from '../../../network/gun/version.2'
import { encodeArrayBuffer } from '../../../utils/type-transform/String-ArrayBuffer'
import { constructAlpha38, PayloadLatest } from '../../../utils/type-transform/Payload'
import { getMyPrivateKey, Group } from '../../../database'
import { queryLocalKeyDB } from '../../../database/people'
import { PersonIdentifier, PostIVIdentifier, GroupIdentifier, Identifier } from '../../../database/type'
import { prepareOthersKeyForEncryptionV39OrV38 } from '../prepareOthersKeyForEncryption'
import { geti18nString } from '../../../utils/i18n'
import { getNetworkWorker } from '../../../social-network/worker'
import { getSignablePayload } from './utils'
import { updatePostDB, createPostDB, PostRecord, RecipientReason } from '../../../database/post'
import { queryUserGroup } from '../PeopleService'

type EncryptedText = string
type OthersAESKeyEncryptedToken = string
/**
 * This map stores <iv, othersAESKeyEncrypted>.
 */
const OthersAESKeyEncryptedMap = new Map<OthersAESKeyEncryptedToken, Alpha38.PublishedAESKeyRecordV39OrV38[]>()

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
    content: string,
    to: (PersonIdentifier | GroupIdentifier)[],
    whoAmI: PersonIdentifier,
): Promise<[EncryptedText, OthersAESKeyEncryptedToken]> {
    if (to.length === 0) return ['', '']

    const recipients: PostRecord['recipients'] = {}
    function addRecipients(x: PersonIdentifier, reason: RecipientReason) {
        const id = x.toText()
        if (recipients[id]) recipients[id].reason.push(reason)
        else recipients[id] = { reason: [reason] }
    }
    const sharedGroups = new Set<Group>()
    for (const i of to) {
        if (i instanceof PersonIdentifier) addRecipients(i, { type: 'direct', at: new Date() })
        // TODO: Should we throw if there the group is not find?
        else sharedGroups.add((await queryUserGroup(i))!)
    }
    for (const group of sharedGroups) {
        for (const each of group.members) {
            addRecipients(each, { at: new Date(), type: 'group', group: group.identifier })
        }
    }

    const toKey = await prepareOthersKeyForEncryptionV39OrV38(
        Object.keys(recipients).map(Identifier.fromString) as PersonIdentifier[],
    )
    const mine = await getMyPrivateKey(whoAmI)
    if (!mine) throw new TypeError('Not inited yet')
    const {
        encryptedContent: encryptedText,
        othersAESKeyEncrypted,
        ownersAESKeyEncrypted,
        iv,
        postAESKey,
    } = await Alpha38.encrypt1ToN({
        version: -38,
        content,
        othersPublicKeyECDH: toKey,
        ownersLocalKey: (await queryLocalKeyDB(whoAmI))!,
        privateKeyECDH: mine.privateKey,
        iv: crypto.getRandomValues(new Uint8Array(16)),
    })

    const payload: PayloadLatest = {
        AESKeyEncrypted: encodeArrayBuffer(ownersAESKeyEncrypted),
        encryptedText: encodeArrayBuffer(encryptedText),
        iv: encodeArrayBuffer(iv),
        signature: '',
        sharedPublic: false,
        version: -38,
    }

    const payloadWaitToSign = getSignablePayload(payload)
    payload.signature = encodeArrayBuffer(await Alpha38.sign(payloadWaitToSign, mine.privateKey))

    await createPostDB({
        identifier: new PostIVIdentifier(whoAmI.network, payload.iv),
        postBy: whoAmI,
        postCryptoKey: postAESKey,
        recipients: recipients,
        foundAt: new Date(),
        recipientGroups: to.filter(x => x instanceof GroupIdentifier) as GroupIdentifier[],
    })

    const postAESKeyToken = encodeArrayBuffer(iv)
    OthersAESKeyEncryptedMap.set(postAESKeyToken, othersAESKeyEncrypted)
    return [constructAlpha38(payload, getNetworkWorker(whoAmI.network).payloadEncoder), postAESKeyToken]
}

/**
 * MUST call before send post, or othersAESKeyEncrypted will not be published to the internet!
 * TODO: If we can use PostIVIdentifier to avoid this hacking way to publish PostAESKey?
 * @param iv Token that returns in the encryptTo
 */
export async function publishPostAESKey(iv: string) {
    if (!OthersAESKeyEncryptedMap.has(iv)) throw new Error(geti18nString('service_publish_post_aes_key_failed'))
    // Use the latest payload version here since we do not accept new post for older version.
    return Gun2.publishPostAESKeyOnGun2(-38, iv, OthersAESKeyEncryptedMap.get(iv)!)
}
