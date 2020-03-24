/// <reference path="./global.d.ts" />
import { DBSchema, openDB, IDBPTransaction } from 'idb/with-async-ittr'
import { GroupIdentifier, Identifier, ProfileIdentifier } from './type'
import { MessageCenter } from '../utils/messages'
import { PrototypeLess, restorePrototypeArray } from '../utils/type'
import { createDBAccess } from './helpers/openDB'

//#region Schema
interface GroupRecordBase {
    groupName: string
}
interface GroupRecordInDatabase extends GroupRecordBase {
    /** Index */
    network: string
    identifier: string
    members: PrototypeLess<ProfileIdentifier>[]
    /**
     * Ban list of this group.
     * Only used for virtual group currently
     *
     * Used to remember if user clicks
     * > they is not my friend, don't add them to my auto-share list again!
     */
    banned?: PrototypeLess<ProfileIdentifier>[]
}
export interface GroupRecord extends GroupRecordBase {
    identifier: GroupIdentifier
    members: ProfileIdentifier[]
    banned?: ProfileIdentifier[]
}
interface GroupDB extends DBSchema {
    /** Key is value.identifier */
    groups: {
        value: GroupRecordInDatabase
        key: string
        indexes: {
            // Use `network` field as index
            network: string
        }
    }
}
//#endregion

const db = createDBAccess(() => {
    return openDB<GroupDB>('maskbook-user-groups', 1, {
        upgrade(db, oldVersion, newVersion, transaction) {
            // Out line keys
            db.createObjectStore('groups', { keyPath: 'identifier' })
            transaction.objectStore('groups').createIndex('network', 'network', { unique: false })
        },
    })
})
export const GroupDBAccess = db
type GroupTransaction = IDBPTransaction<GroupDB, ['groups']>

/**
 * This function create a new user group
 * It will return a GroupIdentifier
 * @param group GroupIdentifier
 * @param groupName
 */
export async function createUserGroupDatabase(
    group: GroupIdentifier,
    groupName: string,
    t?: GroupTransaction,
): Promise<void> {
    t = t || (await db()).transaction('groups', 'readwrite')
    await t.objectStore('groups').put({
        groupName,
        identifier: group.toText(),
        members: [],
        network: group.network,
    })
}

export async function createOrUpdateUserGroupDatabase(
    group: Partial<GroupRecord> & Pick<GroupRecord, 'identifier' | 'groupName'>,
    type: 'append' | 'replace' | ((record: GroupRecord) => GroupRecord | void),
    t?: GroupTransaction,
) {
    t = t || (await db()).transaction('groups', 'readwrite')
    if (await queryUserGroupDatabase(group.identifier, t)) return updateUserGroupDatabase(group, type, t)
    else return createUserGroupDatabase(group.identifier, group.groupName, t)
}

/**
 * Delete a user group that stored in the Maskbook
 * @param group Group ID
 */
export async function deleteUserGroupDatabase(group: GroupIdentifier, t?: GroupTransaction): Promise<void> {
    t = t || (await db()).transaction('groups', 'readwrite')
    await t.objectStore('groups').delete(group.toText())
}

/**
 * Update a user group that stored in the Maskbook
 * @param group Group ID
 * @param type
 */
export async function updateUserGroupDatabase(
    group: Partial<GroupRecord> & Pick<GroupRecord, 'identifier'>,
    type: 'append' | 'replace' | ((record: GroupRecord) => GroupRecord | void),
    t?: GroupTransaction,
): Promise<void> {
    t = t || (await db()).transaction('groups', 'readwrite')

    const orig = await queryUserGroupDatabase(group.identifier, t)
    if (!orig) throw new TypeError('User group not found')

    let nextRecord: GroupRecord
    const nonDuplicateNewMembers: ProfileIdentifier[] = []
    if (type === 'replace') {
        nextRecord = { ...orig, ...group }
    } else if (type === 'append') {
        const nextMembers = new Set<string>()
        for (const i of orig.members) {
            nextMembers.add(i.toText())
        }
        for (const i of group.members || []) {
            if (!nextMembers.has(i.toText())) {
                nextMembers.add(i.toText())
                nonDuplicateNewMembers.push(i)
            }
        }
        nextRecord = {
            identifier: group.identifier,
            banned: !orig.banned && !group.banned ? undefined : [...(orig.banned || []), ...(group.banned || [])],
            groupName: group.groupName || orig.groupName,
            members: Array.from(nextMembers)
                .map((x) => Identifier.fromString(x, ProfileIdentifier))
                .filter((x) => x.ok)
                .map((x) => x.val as ProfileIdentifier),
        }
    } else {
        nextRecord = type(orig) || orig
    }
    await t.objectStore('groups').put(GroupRecordIntoDB(nextRecord))

    if (process.env.NODE_ENV !== 'test' && nonDuplicateNewMembers.length) {
        MessageCenter.emit('joinGroup', {
            group: group.identifier,
            newMembers: nonDuplicateNewMembers,
        })
    }
}

/**
 * Query a user group that stored in the Maskbook
 * @param group Group ID
 */
export async function queryUserGroupDatabase(
    group: GroupIdentifier,
    t?: GroupTransaction,
): Promise<null | GroupRecord> {
    t = t || (await db()).transaction('groups', 'readonly')
    const result = await t.objectStore('groups').get(group.toText())
    if (!result) return null
    return GroupRecordOutDB(result)
}

/**
 * Query user groups that stored in the Maskbook
 * @param query Query ID
 */
export async function queryUserGroupsDatabase(
    query: ((key: GroupIdentifier, record: GroupRecordInDatabase) => boolean) | { network: string },
    t?: GroupTransaction,
): Promise<GroupRecord[]> {
    t = t || (await db()).transaction('groups')
    const result: GroupRecordInDatabase[] = []
    if (typeof query === 'function') {
        for await (const { value, key } of t.store) {
            const identifier = Identifier.fromString(key, GroupIdentifier)
            if (identifier.err) {
                console.warn('Invalid identifier', key)
                continue
            }
            if (query(identifier.val, value)) result.push(value)
        }
    } else {
        result.push(
            // ? WKWebview bug https://bugs.webkit.org/show_bug.cgi?id=177350
            ...(webpackEnv.target === 'WKWebview'
                ? (await t.objectStore('groups').getAll()).filter((obj) => obj.network === query.network)
                : await t.objectStore('groups').index('network').getAll(IDBKeyRange.only(query.network))),
        )
    }
    return result.map(GroupRecordOutDB)
}

function GroupRecordOutDB(x: GroupRecordInDatabase): GroupRecord {
    return {
        ...x,
        identifier: Identifier.fromString(x.identifier, GroupIdentifier).unwrap(),
        members: restorePrototypeArray(x.members, ProfileIdentifier.prototype),
        banned: restorePrototypeArray(x.banned, ProfileIdentifier.prototype),
    }
}
function GroupRecordIntoDB(x: GroupRecord): GroupRecordInDatabase {
    return {
        ...x,
        identifier: x.identifier.toText(),
        network: x.identifier.network,
    }
}
