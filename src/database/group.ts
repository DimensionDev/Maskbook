/// <reference path="./global.d.ts" />
import { openDB, DBSchema } from 'idb/with-async-ittr'
import { GroupIdentifier, PersonIdentifier, GroupType, PreDefinedVirtualGroupType } from './type'

//#region Schema
interface GroupRecordBase {
    members: PersonIdentifier[]
    /**
     * Ban list of this group.
     * Only used for virtual group currently
     *
     * Used to remember if user clicks
     * > they is not my friend, don't add them to my auto-share list again!
     */
    banned?: PersonIdentifier[]
    /** Index */
    network: string
    groupName: string
}
interface GroupRecordInDatabase extends GroupRecordBase {
    identifier: string
}
export interface GroupRecord extends GroupRecordBase {
    identifier: GroupIdentifier
}
interface AvatarDB extends DBSchema {
    /** Key is value.identifier */
    groups: {
        value: GroupRecordInDatabase
        key: string
    }
}
//#endregion

const db = openDB<AvatarDB>('maskbook-user-groups', 1, {
    upgrade(db, oldVersion, newVersion, transaction) {
        // Out line keys
        db.createObjectStore('groups', { keyPath: 'identifier' })
    },
})

/**
 * This function create a new user group
 * It will return a GroupIdentifier
 * @param group GroupIdentifier
 */
export async function createUserGroupDatabase(group: GroupIdentifier, groupName: string): Promise<void> {
    const t = (await db).transaction('groups', 'readwrite')
    await t.objectStore('groups').put({
        groupName,
        identifier: group.toText(),
        members: [],
        network: group.network,
    })
    return
}

/**
 * Delete a user group that stored in the Maskbook
 * @param group Group ID
 */
declare function deleteUserGroupDatabase(group: GroupIdentifier): Promise<void>

/**
 * Update a user group that stored in the Maskbook
 * @param group Group ID
 */
declare function updateUserGroupDatabase(group: Partial<GroupRecord>): Promise<void>

/**
 * Query a user group that stored in the Maskbook
 * @param group Group ID
 */
declare function queryUserGroupDatabase(group: GroupIdentifier): Promise<void>

/**
 * Query user groups that stored in the Maskbook
 * @param group Group ID
 */
declare function queryUserGroupsDatabase(
    query: ((key: GroupIdentifier, record: GroupRecordInDatabase) => boolean) | { network: string },
): Promise<void>
