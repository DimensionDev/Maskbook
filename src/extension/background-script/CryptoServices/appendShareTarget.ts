import * as Alpha40 from '../../../crypto/crypto-alpha-40'
import * as Alpha39 from '../../../crypto/crypto-alpha-39'
import * as Gun1 from '../../../network/gun/version.1'
import * as Gun2 from '../../../network/gun/version.2'
import { getMyPrivateKey } from '../../../database'
import { queryLocalKeyDB } from '../../../database/people'
import { PersonIdentifier } from '../../../database/type'
import { prepareOthersKeyForEncryption } from '../prepareOthersKeyForEncryption'
export async function appendShareTarget(
    postIdentifier: string,
    ownersAESKeyEncrypted: string,
    iv: string,
    people: PersonIdentifier[],
    whoAmI: PersonIdentifier,
): Promise<void> {
    const toKey = await prepareOthersKeyForEncryption(people)
    const AESKey = await Alpha40.extractAESKeyInMessage(
        -40,
        ownersAESKeyEncrypted,
        iv,
        (await queryLocalKeyDB(whoAmI))!,
    )
    const othersAESKeyEncrypted = await Alpha40.generateOthersAESKeyEncryptedV40(
        -40,
        AESKey,
        (await getMyPrivateKey(whoAmI))!.privateKey,
        toKey,
    )
    Gun1.publishPostAESKey(postIdentifier, whoAmI, othersAESKeyEncrypted)
}
