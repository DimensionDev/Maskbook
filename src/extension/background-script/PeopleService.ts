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
import { PersonIdentifier, GroupIdentifier } from '../../database/type'
import { geti18nString } from '../../utils/i18n'
import { import_AES_GCM_256_Key, import_ECDH_256k1_Key } from '../../utils/crypto.subtle'

OnlyRunInContext('background', 'FriendService')
export { storeAvatar, getAvatarDataURL, queryPerson } from '../../database'
export { writePersonOnGun } from '../../network/gun/version.2/people'
export {
    addPersonToFriendsGroup,
    createDefaultFriendsGroup,
    removePersonFromFriendsGroup,
    queryUserGroups,
} from '../../database/helpers/group'
export { queryUserGroupDatabase as queryUserGroup } from '../../database/group'
export { removePeopleDB as removePeople } from '../../database/people'
/**
 * Query all people stored
 */
export async function queryPeople(network?: string): Promise<Person[]> {
    return queryPeopleWithQuery(network ? { network } : undefined)
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
 * Remove an identity.
 */
export async function removeMyIdentity(identifier: PersonIdentifier): Promise<void> {
    await deleteLocalKeyDB(identifier)
    await removeMyIdentityAtDB(identifier)
}
/**
 * Restore the backup
 */
export async function restoreBackup(json: object, whoAmI?: PersonIdentifier): Promise<void> {
    async function storeMyIdentity(person: PersonRecordPublicPrivate, local: JsonWebKey) {
        await storeMyIdentityDB(person)
        const aes = await import_AES_GCM_256_Key(local)
        if ((await queryLocalKeyDB(new PersonIdentifier(person.identifier.network, '$self'))) === null)
            await storeLocalKeyDB(new PersonIdentifier(person.identifier.network, '$self'), aes)
        await storeLocalKeyDB(person.identifier, aes)
    }
    function mapID(x: { network: string; userId: string }): PersonIdentifier {
        return new PersonIdentifier(x.network, x.userId)
    }
    function mapGroup(x: { network: string; groupID: string; virtualGroupOwner: string | null }): GroupIdentifier {
        return new GroupIdentifier(x.network, x.virtualGroupOwner, x.groupID)
    }
    const data = UpgradeBackupJSONFile(json, whoAmI)
    if (!data) throw new TypeError(geti18nString('service_invalid_backup_file'))

    const myIdentitiesInBackup = Promise.all(
        data.whoami.map(async rec => {
            const IAm = mapID(rec)
            const previousIdentifiers = (rec.previousIdentifiers || []).map(mapID)
            await storeMyIdentity(
                {
                    identifier: IAm,
                    groups: [],
                    nickname: rec.nickname,
                    previousIdentifiers: previousIdentifiers,
                    publicKey: await import_ECDH_256k1_Key(rec.publicKey),
                    privateKey: await import_ECDH_256k1_Key(rec.privateKey),
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
                publicKey: await import_ECDH_256k1_Key(rec.publicKey),
            })
        }),
    )

    await myIdentitiesInBackup
    await people
}

/**
 * Resolve my possible identity
 */
export async function resolveIdentity(identifier: PersonIdentifier) {
    const unknown = new PersonIdentifier(identifier.network, '$unknown')
    const self = new PersonIdentifier(identifier.network, '$self')
    {
        const ids = (await getMyIdentitiesDB()).filter(x => x.identifier.equals(unknown) || x.identifier.equals(self))
        for (const id of ids) {
            await storeMyIdentityDB({ ...id, identifier })
        }
        removeMyIdentityAtDB(unknown)
        removeMyIdentityAtDB(self)
    }
    {
        const locals = await queryLocalKeyDB(identifier.network)
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

export async function updatePersonInfo(
    identifier: PersonIdentifier,
    data: { nickname?: string; avatarURL?: string; forceUpdateAvatar?: boolean },
) {
    const { avatarURL, nickname, forceUpdateAvatar } = data
    if (nickname) updatePersonDB({ identifier, nickname })
    if (avatarURL) storeAvatar(identifier, avatarURL, forceUpdateAvatar)
}
