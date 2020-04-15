import * as Alpha39 from '../../../crypto/crypto-alpha-39'
import * as Gun2 from '../../../network/gun/version.2'
import { ProfileIdentifier, PostIVIdentifier } from '../../../database/type'
import { prepareRecipientDetail } from './prepareRecipientDetail'
import { cryptoProviderTable } from './utils'
import { updatePostDB, RecipientDetail, RecipientReason } from '../../../database/post'
import { getNetworkWorker } from '../../../social-network/worker'
import { queryPrivateKey, queryLocalKey } from '../../../database'
import { IdentifierMap } from '../../../database/IdentifierMap'
import type { AESJsonWebKey, EC_Private_JsonWebKey } from '../../../modules/CryptoAlgorithm/interfaces/utils'
export async function appendShareTarget(
    version: -40 | -39 | -38,
    postAESKey: string | AESJsonWebKey,
    iv: string,
    people: ProfileIdentifier[],
    whoAmI: ProfileIdentifier,
    reason: RecipientReason,
): Promise<void> {
    const cryptoProvider = cryptoProviderTable[version]
    if (typeof postAESKey === 'string') {
        const AESKey = await cryptoProvider.extractAESKeyInMessage(
            version,
            postAESKey,
            iv,
            (await queryLocalKey(whoAmI))!,
        )
        return appendShareTarget(version, AESKey, iv, people, whoAmI, reason)
    }
    const myPrivateKey: EC_Private_JsonWebKey = (await queryPrivateKey(whoAmI))!
    if (version === -39 || version === -38) {
        const [, toKey] = await prepareRecipientDetail(people)
        const othersAESKeyEncrypted = await Alpha39.generateOthersAESKeyEncrypted(
            version,
            postAESKey,
            myPrivateKey,
            Array.from(toKey.values()),
        )
        Gun2.publishPostAESKeyOnGun2(version, iv, getNetworkWorker(whoAmI).gunNetworkHint, othersAESKeyEncrypted)
        updatePostDB(
            {
                identifier: new PostIVIdentifier(whoAmI.network, iv),
                recipients: new IdentifierMap(
                    new Map(
                        people.map<[string, RecipientDetail]>((identifier) => [
                            identifier.toText(),
                            {
                                reason: [reason],
                                published: toKey.has(identifier),
                            },
                        ]),
                    ),
                    ProfileIdentifier,
                ),
            },
            'append',
        )
    } else if (version === -40) {
        throw new TypeError('Version -40 cannot create new data anymore due to leaking risks.')
    }
}
