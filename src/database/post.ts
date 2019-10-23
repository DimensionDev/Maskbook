/// <reference path="./global.d.ts" />
import { PostIdentifier, PersonIdentifier, Identifier, PostIVIdentifier, GroupIdentifier } from './type'
import { openDB, DBSchema } from 'idb/with-async-ittr'
import { restorePrototype } from './utils'

function outDb(db: PostDBRecord): PostRecord {
    const { identifier, ...rest } = db
    for (const key in rest.recipients) {
        const detail = rest.recipients[key]
        detail.reason.forEach(x => x.type === 'group' && restorePrototype(x.group, GroupIdentifier.prototype))
    }
    return {
        ...rest,
        identifier: Identifier.fromString(identifier) as PostIVIdentifier,
    }
}
function toDb(out: PostRecord): PostDBRecord {
    return { ...out, identifier: out.identifier.toText() }
}
export interface PostRecord extends Omit<PostDBRecord, 'identifier'> {
    identifier: PostIVIdentifier
}

interface RecipientDetail {
    /** Why they're able to receive this message? */
    reason: Array<
        ({ type: 'direct' } | { type: 'group'; group: GroupIdentifier[] }) & {
            /**
             * When we send the key to them by this reason?
             * If the unix timestamp of this Date is 0,
             * should display it as "unknown" or "before Nov 2019"
             */
            at: Date
        }
    >
}
interface PostDBRecord {
    /**
     * For old data stored before version 3,
     * this identifier may be PersonIdentifier.unknown
     */
    postBy: PersonIdentifier
    identifier: string
    /**
     * ! This MUST BE a native CryptoKey
     */
    postCryptoKey?: CryptoKey
    recipients: Record<string, RecipientDetail>
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
            db.createObjectStore('post', { keyPath: 'identifier' })
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
                    const id = Identifier.fromString(each.identifier)
                    if (id instanceof PostIdentifier) {
                        each.identifier = new PostIVIdentifier(
                            (id.identifier as PersonIdentifier).network,
                            id.postId,
                        ).toText()
                    }
                    store.add(each)
                }
            })
        }

        /**
         * In the version 2 we use `recipients?: PersonIdentifier[]`
         * After upgrade to version 3, we use `recipients: Record<string, RecipientDetail>`
         */
        if (oldVersion <= 2) {
            const store = transaction.objectStore('post')
            for await (const cursor of store) {
                const oldType = (cursor.value.recipients as unknown) as PersonIdentifier[] | undefined
                restorePrototype(oldType, PersonIdentifier.prototype)
                const newType: PostDBRecord['recipients'] = {}
                if (oldType !== undefined)
                    for (const each of oldType) {
                        newType[each.toText()] = { reason: [{ type: 'direct', at: new Date(0) }] }
                    }

                cursor.update({
                    ...cursor.value,
                    recipients: newType,
                    postBy: PersonIdentifier.unknown,
                })
            }
        }
    },
})
export async function updatePostDB(
    updateRecord: Partial<PostRecord> & Pick<PostRecord, 'identifier'>,
    mode: 'append' | 'override',
): Promise<void> {
    const currentRecord =
        (await queryPostDB(updateRecord.identifier)) ||
        ({
            identifier: updateRecord.identifier,
            recipients: {},
            postBy: PersonIdentifier.unknown,
        } as PostRecord)
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
export async function deletePostCryptoKeyDB(record: PostIVIdentifier) {
    const t = (await db).transaction('post', 'readwrite')
    await t.objectStore('post').delete(record.toText())
}

declare function backupPostCryptoKeyDB(): Promise<unknown>
