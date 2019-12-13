/// <reference path="./global.d.ts" />
import { PostIdentifier, ProfileIdentifier, Identifier, PostIVIdentifier, GroupIdentifier } from './type'
import { openDB, DBSchema } from 'idb/with-async-ittr'
import { restorePrototype, restorePrototypeArray } from '../utils/type'

function outDb(db: PostDBRecord): PostRecord {
    const { identifier, ...rest } = db
    for (const key in rest.recipients) {
        const detail = rest.recipients[key]
        detail.reason.forEach(x => x.type === 'group' && restorePrototype(x.group, GroupIdentifier.prototype))
    }
    restorePrototypeArray(rest.recipientGroups, GroupIdentifier.prototype)
    return {
        ...rest,
        identifier: Identifier.fromString(identifier, PostIVIdentifier).unwrap(
            `Invalid identifier, expected PostIVIdentifier, actual ${identifier}`,
        ),
    }
}
function toDb(out: PostRecord): PostDBRecord {
    return { ...out, identifier: out.identifier.toText() }
}
export interface PostRecord extends Omit<PostDBRecord, 'identifier'> {
    identifier: PostIVIdentifier
}

/**
 * When you change this, change RecipientReasonJSON as well!
 */
export type RecipientReason = ({ type: 'direct' } | { type: 'group'; group: GroupIdentifier }) & {
    /**
     * When we send the key to them by this reason?
     * If the unix timestamp of this Date is 0,
     * should display it as "unknown" or "before Nov 2019"
     */
    at: Date
}
export interface RecipientDetail {
    /** Why they're able to receive this message? */
    reason: RecipientReason[]
}
interface PostDBRecord {
    /**
     * For old data stored before version 3,
     * this identifier may be ProfileIdentifier.unknown
     */
    postBy: ProfileIdentifier
    identifier: string
    /**
     * ! This MUST BE a native CryptoKey
     */
    postCryptoKey?: CryptoKey
    /**
     * Receivers.
     */
    recipients: Record<string, RecipientDetail>
    /**
     * This post shared with these groups.
     */
    recipientGroups: GroupIdentifier[]
    /**
     * When does Maskbook find this post.
     * For your own post, it is when Maskbook created this post.
     * For others post, it is when you see it first time.
     */
    foundAt: Date
}
interface PostDB extends DBSchema {
    /** Use inline keys */
    post: {
        value: PostDBRecord
        key: string
    }
}
const db = openDB<PostDB>('maskbook-post-v2', 3, {
    async upgrade(db, oldVersion, newVersion, transaction) {
        if (oldVersion < 1) {
            // inline keys
            return void db.createObjectStore('post', { keyPath: 'identifier' })
        }
        /**
         * In the version 1 we use PostIdentifier to store post that identified by post iv
         * After upgrade to version 2, we use PostIVIdentifier to store it.
         * So we transform all old data into new data.
         */
        if (oldVersion <= 1) {
            const store = transaction.objectStore('post')
            store.getAll().then(values => {
                store.clear()
                for (const each of values) {
                    const id = Identifier.fromString(each.identifier, PostIdentifier).value
                    if (id) {
                        each.identifier = new PostIVIdentifier(
                            (id.identifier as ProfileIdentifier).network,
                            id.postId,
                        ).toText()
                    }
                    store.add(each)
                }
            })
        }

        /**
         * In the version 2 we use `recipients?: ProfileIdentifier[]`
         * After upgrade to version 3, we use `recipients: Record<string, RecipientDetail>`
         */
        if (oldVersion <= 2) {
            const store = transaction.objectStore('post')
            for await (const cursor of store) {
                const oldType = (cursor.value.recipients as unknown) as ProfileIdentifier[] | undefined
                oldType && restorePrototypeArray(oldType, ProfileIdentifier.prototype)
                const newType: PostDBRecord['recipients'] = {}
                if (oldType !== undefined)
                    for (const each of oldType) {
                        newType[each.toText()] = { reason: [{ type: 'direct', at: new Date(0) }] }
                    }
                const next: PostDBRecord = {
                    ...cursor.value,
                    recipients: newType,
                    postBy: ProfileIdentifier.unknown,
                    foundAt: new Date(0),
                    recipientGroups: [],
                }
                cursor.update(next)
            }
        }
    },
})
export async function createPostDB(record: PostRecord) {
    const t = (await db).transaction('post', 'readwrite')
    const toSave = toDb(record)
    await t.objectStore('post').add(toSave)
}
export async function updatePostDB(
    updateRecord: Partial<PostRecord> & Pick<PostRecord, 'identifier'>,
    mode: 'append' | 'override',
): Promise<void> {
    const emptyRecord: PostRecord = {
        identifier: updateRecord.identifier,
        recipients: {},
        postBy: ProfileIdentifier.unknown,
        foundAt: new Date(),
        recipientGroups: [],
    }
    const currentRecord = (await queryPostDB(updateRecord.identifier)) || emptyRecord
    const nextRecord: PostRecord = { ...currentRecord, ...updateRecord }
    const nextRecipients: PostDBRecord['recipients'] =
        mode === 'override' ? toDb(nextRecord).recipients : toDb(currentRecord).recipients
    if (mode === 'append') {
        if (updateRecord.recipients) {
            for (const [id, detail] of Object.entries(updateRecord.recipients)) {
                if (nextRecipients[id]) {
                    const { reason, ...rest } = detail
                    Object.assign(nextRecipients[id], rest)
                    nextRecipients[id].reason.concat(detail.reason)
                } else {
                    nextRecipients[id] = detail
                }
            }
        }
    }
    const t = (await db).transaction('post', 'readwrite')
    const nextRecordInDBType = toDb(nextRecord)
    await t.objectStore('post').put(nextRecordInDBType)
}
export async function queryPostDB(record: PostIVIdentifier): Promise<PostRecord | null> {
    const t = (await db).transaction('post')
    const result = await t.objectStore('post').get(record.toText())
    if (result) return outDb(result)
    return null
}
export async function queryPostsDB(network: string): Promise<PostRecord[]>
export async function queryPostsDB(query: (data: PostRecord, id: PostIVIdentifier) => boolean): Promise<PostRecord[]>
export async function queryPostsDB(
    query: string | ((data: PostRecord, id: PostIVIdentifier) => boolean),
): Promise<PostRecord[]> {
    const t = (await db).transaction('post')
    const selected: PostRecord[] = []
    for await (const { value } of t.store) {
        const id = Identifier.fromString(value.identifier, PostIVIdentifier).value
        if (!id) {
            console.warn(`Found invalid identifier, expected ${PostIVIdentifier}, found ${value.identifier}`)
            continue
        }
        if (typeof query === 'string') {
            if (id.network === query) selected.push(outDb(value))
        } else {
            const v = outDb(value)
            if (query(v, id)) selected.push(v)
        }
    }
    return selected
}
export async function deletePostCryptoKeyDB(record: PostIVIdentifier) {
    const t = (await db).transaction('post', 'readwrite')
    await t.objectStore('post').delete(record.toText())
}

declare function backupPostCryptoKeyDB(): Promise<unknown>
