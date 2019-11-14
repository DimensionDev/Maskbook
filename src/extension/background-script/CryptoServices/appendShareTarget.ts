import * as Alpha39 from '../../../crypto/crypto-alpha-39'
import * as Gun2 from '../../../network/gun/version.2'
import { ProfileIdentifier, PostIVIdentifier, GroupIdentifier, constructPostRecipients } from '../../../database/type'
import { prepareOthersKeyForEncryptionV39OrV38 } from '../prepareOthersKeyForEncryption'
import { cryptoProviderTable } from './utils'
import { updatePostDB, RecipientDetail } from '../../../database/post'
import { getNetworkWorker } from '../../../social-network/worker'
import { queryPrivateKey, queryLocalKey } from '../../../database'
export async function appendShareTarget(
    version: -40 | -39 | -38,
    postAESKey: string | CryptoKey,
    iv: string,
    people: ProfileIdentifier[],
    whoAmI: ProfileIdentifier,
    invitedBy?: GroupIdentifier,
): Promise<void> {
    const cryptoProvider = cryptoProviderTable[version]
    if (typeof postAESKey === 'string') {
        const AESKey = await cryptoProvider.extractAESKeyInMessage(
            version,
            postAESKey,
            iv,
            (await queryLocalKey(whoAmI))!,
        )
        return appendShareTarget(version, AESKey, iv, people, whoAmI)
    }
    const AESKey: CryptoKey = postAESKey
    const myPrivateKey: CryptoKey = (await queryPrivateKey(whoAmI))!
    if (version === -39 || version === -38) {
        const toKey = await prepareOthersKeyForEncryptionV39OrV38(people)
        const othersAESKeyEncrypted = await Alpha39.generateOthersAESKeyEncrypted(version, AESKey, myPrivateKey, toKey)
        Gun2.publishPostAESKeyOnGun2(version, iv, getNetworkWorker(whoAmI).gunNetworkHint, othersAESKeyEncrypted)
        updatePostDB(
            {
                identifier: new PostIVIdentifier(whoAmI.network, iv),
                recipients: constructPostRecipients(
                    people.map<[ProfileIdentifier, RecipientDetail]>(identifier => [
                        identifier,
                        {
                            reason: [
                                invitedBy
                                    ? { at: new Date(), group: invitedBy, type: 'group' }
                                    : { at: new Date(), type: 'direct' },
                            ],
                        },
                    ]),
                ),
            },
            'append',
        )
    } else if (version === -40) {
        throw new TypeError('Version -40 cannot create new data anymore due to leaking risks.')
    }
}
