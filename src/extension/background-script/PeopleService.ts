import { OnlyRunInContext } from '@holoflows/kit/es'
import { Person, queryPeopleWithQuery, personRecordToPerson } from '../../database'
import {
    storeDefaultLocalKeyDB,
    storeMyIdentityDB,
    PersonRecordPublicPrivate,
    getDefaultLocalKeyDB,
    storeLocalKeyDB,
    storeNewPersonDB,
    queryMyIdentityAtDB,
} from '../../database/people'
import { UpgradeBackupJSONFile } from '../../utils/type-transform/BackupFile'
import { PersonIdentifier, GroupIdentifier } from '../../database/type'

OnlyRunInContext('background', 'FriendService')
export { storeAvatar, getAvatarDataURL as getAvatarBlobURL, queryPerson } from '../../database'
export { uploadProvePostUrl } from '../../key-management/people-gun'
/**
 * Query all people stored
 */
export async function queryPeople(network: string): Promise<Person[]> {
    return queryPeopleWithQuery({ network })
}

export async function queryMyIdentity(identifier: PersonIdentifier) {
    const result = await queryMyIdentityAtDB(identifier)
    if (result) return personRecordToPerson(result)
    return null
}

/**
 * Restore the backup
 */
export async function restoreBackup(json: object, iam?: PersonIdentifier) {
    async function storeMyIdentity(person: PersonRecordPublicPrivate, local: JsonWebKey) {
        await storeMyIdentityDB(person)
        const aes = await crypto.subtle.importKey('jwk', local, { name: 'AES-GCM', length: 256 }, true, [
            'encrypt',
            'decrypt',
        ])
        if (await getDefaultLocalKeyDB()) {
        } else {
            await storeDefaultLocalKeyDB(aes)
        }
        await storeLocalKeyDB(person.identifier, aes)
    }
    function importKey(x: JsonWebKey) {
        return crypto.subtle.importKey('jwk', x, { name: 'ECDH', namedCurve: 'K-256' }, true, ['deriveKey'])
    }
    function mapID(x: { network: string; userId: string }): PersonIdentifier {
        return new PersonIdentifier(x.network, x.userId)
    }
    function mapGroup(x: { network: string; groupId: string; virtual: boolean }): GroupIdentifier {
        return new GroupIdentifier(x.network, x.groupId, x.virtual)
    }
    const data = UpgradeBackupJSONFile(json, iam)
    if (!data) return false

    const whoami = Promise.all(
        data.whoami.map(async rec => {
            const IAm = mapID(rec)
            const previousIdentifiers = (rec.previousIdentifiers || []).map(mapID)
            await storeMyIdentity(
                {
                    identifier: IAm,
                    groups: [],
                    nickname: rec.nickname,
                    previousIdentifiers: previousIdentifiers,
                    publicKey: await importKey(rec.publicKey),
                    privateKey: await importKey(rec.privateKey),
                    relation: [],
                    relationLastCheckTime: new Date(),
                },
                rec.localKey,
            )
        }),
    )

    const people = Promise.all(
        (data.people || []).map(async rec => {
            const id = new PersonIdentifier(rec.network, rec.userId)
            const groups = (rec.groups || []).map(mapGroup)
            const prevIds = (rec.previousIdentifiers || []).map(mapID)
            await storeNewPersonDB({
                identifier: id,
                groups: groups,
                nickname: rec.nickname,
                previousIdentifiers: prevIds,
                publicKey: await importKey(rec.publicKey),
                relation: rec.relation || [],
                relationLastCheckTime: rec.relationLastCheckTime ? new Date(rec.relationLastCheckTime) : new Date(),
            })
        }),
    )

    await whoami
    await people
    return true
}
