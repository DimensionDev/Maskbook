import * as Alpha40 from '../../../crypto/crypto-alpha-40'
import * as Alpha39 from '../../../crypto/crypto-alpha-39'
import * as Gun1 from '../../../network/gun/version.1'
import * as Gun2 from '../../../network/gun/version.2'
import { getMyPrivateKey } from '../../../database'
import { queryLocalKeyDB } from '../../../database/people'
import { PersonIdentifier } from '../../../database/type'
import { prepareOthersKeyForEncryptionV40, prepareOthersKeyForEncryptionV39 } from '../prepareOthersKeyForEncryption'
export async function appendShareTarget(
    version: -40 | -39,
    postIdentifier: string,
    ownersAESKeyEncrypted: string,
    iv: string,
    people: PersonIdentifier[],
    whoAmI: PersonIdentifier,
): Promise<void> {
    const cryptoProvider = version === -40 ? Alpha40 : Alpha39
    const toKey = await prepareOthersKeyForEncryptionV40(people)
    const AESKey = await cryptoProvider.extractAESKeyInMessage(
        version,
        ownersAESKeyEncrypted,
        iv,
        (await queryLocalKeyDB(whoAmI))!,
    )
    const myPrivateKey = (await getMyPrivateKey(whoAmI))!.privateKey
    if (version === -39) {
        const toKey = await prepareOthersKeyForEncryptionV39(people)
        const othersAESKeyEncrypted = await Alpha39.generateOthersAESKeyEncrypted(-39, AESKey, myPrivateKey, toKey)
        Gun2.publishPostAESKeyOnGun2(-39, iv, othersAESKeyEncrypted)
    } else if (version === -40) {
        const toKey = await prepareOthersKeyForEncryptionV40(people)
        const othersAESKeyEncrypted = await Alpha40.generateOthersAESKeyEncrypted(-40, AESKey, myPrivateKey, toKey)
        // eslint-disable-next-line import/no-deprecated
        Gun1.publishPostAESKey(postIdentifier, whoAmI, othersAESKeyEncrypted)
    }
}
