import { OnlyRunInContext } from '@holoflows/kit/es'
import { Person, queryPeopleWithQuery, personRecordToPerson, storeAvatar } from '../../database'
import {
    storeMyIdentityDB,
    PersonRecordPublicPrivate,
    storeLocalKeyDB,
    storeNewPersonDB,
    queryMyIdentityAtDB,
    getMyIdentitiesDB,
    removeMyIdentityAtDB,
    queryLocalKeyDB,
    deleteLocalKeyDB,
    updatePersonDB,
} from '../../database/people'
import { UpgradeBackupJSONFile } from '../../utils/type-transform/BackupFile'
import { PersonIdentifier, GroupIdentifier, GroupType } from '../../database/type'

OnlyRunInContext('background', 'FriendService')
export { storeAvatar, getAvatarDataURL as getAvatarBlobURL, queryPerson } from '../../database'
export { uploadProvePostUrl } from '../../key-management/people-gun'
/**
 * Query all people stored
 */
export async function queryPeople(network: string): Promise<Person[]> {
    return queryPeopleWithQuery({ network })
}
/**
 * Query my identity.
 */
export async function queryMyIdentity(network?: string): Promise<Person[]>
export async function queryMyIdentity(identifier: PersonIdentifier): Promise<Person[]>
export async function queryMyIdentity(identifier?: PersonIdentifier | string): Promise<Person[]> {
    if (identifier === undefined) {
        const all = await getMyIdentitiesDB()
        return Promise.all(all.map(personRecordToPerson))
    } else if (typeof identifier === 'string') {
        const all = await getMyIdentitiesDB()
        const atSite = all.filter(x => x.identifier.network === identifier)
        return Promise.all(atSite.map(personRecordToPerson))
    } else {
        const result = await queryMyIdentityAtDB(identifier)
        if (result) return [await personRecordToPerson(result)]
        return []
    }
}

/**
 * Restore the backup
 */
export async function restoreBackup(json: object, whoAmI?: PersonIdentifier) {
    async function storeMyIdentity(person: PersonRecordPublicPrivate, local: JsonWebKey) {
        await storeMyIdentityDB(person)
        const aes = await crypto.subtle.importKey('jwk', local, { name: 'AES-GCM', length: 256 }, true, [
            'encrypt',
            'decrypt',
        ])
        await storeLocalKeyDB(new PersonIdentifier('facebook.com', '$self'), aes)
        await storeLocalKeyDB(person.identifier, aes)
    }
    function importKey(x: JsonWebKey) {
        return crypto.subtle.importKey('jwk', x, { name: 'ECDH', namedCurve: 'K-256' }, true, ['deriveKey'])
    }
    function mapID(x: { network: string; userId: string }): PersonIdentifier {
        return new PersonIdentifier(x.network, x.userId)
    }
    function mapGroup(x: { network: string; groupId: string; type: GroupType }): GroupIdentifier {
        return new GroupIdentifier(x.network, x.groupId, x.type)
    }
    const data = UpgradeBackupJSONFile(json, whoAmI)
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
            })
        }),
    )

    await whoami
    await people
    return true
}

/**
 * Resolve my possible identity at facebook.com
 */
export async function resolveIdentityAtFacebook(identifier: PersonIdentifier) {
    const unknown = new PersonIdentifier('facebook.com', '$unknown')
    const self = new PersonIdentifier('facebook.com', '$self')
    {
        const ids = (await getMyIdentitiesDB()).filter(x => x.identifier.equals(unknown) || x.identifier.equals(self))
        for (const id of ids) {
            await storeMyIdentityDB({ ...id, identifier })
        }
        removeMyIdentityAtDB(unknown)
        removeMyIdentityAtDB(self)
    }
    {
        const locals = await queryLocalKeyDB('facebook.com')
        if (locals) {
            if (locals.$unknown) {
                await storeLocalKeyDB(identifier, locals.$unknown)
            }
            if (locals.$self) {
                await storeLocalKeyDB(identifier, locals.$self)
            }
            deleteLocalKeyDB(unknown)
            deleteLocalKeyDB(self)
        }
    }
}

export async function updatePersonInfo(identifier: PersonIdentifier, data: { nickname?: string; avatarURL?: string }) {
    const { avatarURL, nickname } = data
    if (nickname) updatePersonDB({ identifier, nickname })
    if (avatarURL) storeAvatar(identifier, avatarURL)
}
