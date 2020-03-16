/// <reference path="./global.d.ts" />
import { PostIdentifier, ProfileIdentifier, Identifier, PostIVIdentifier, GroupIdentifier } from './type'
import { openDB, DBSchema, IDBPTransaction } from 'idb/with-async-ittr'
import { restorePrototype, restorePrototypeArray, PrototypeLess } from '../utils/type'
import { IdentifierMap } from './IdentifierMap'
import { createDBAccess } from './helpers/openDB'

const db = createDBAccess(() => {
    return openDB<PostDB>('maskbook-post-v2', 3, {
        async upgrade(db, oldVersion, newVersion, transaction): Promise<void> {
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
                        const id = Identifier.fromString(each.identifier, PostIdentifier)
                        if (id.ok) {
                            const { postId, identifier } = id.val
                            each.identifier = new PostIVIdentifier(
                                (identifier as ProfileIdentifier).network,
                                postId,
                            ).toText()
                            store.add(each)
                        }
                    }
                })
            }

            interface Version3RecipientDetail {
                /** Why they're able to receive this message? */
                reason: RecipientReason[]
            }
            type Version3PostDBRecord = Omit<PostDBRecord, 'recipients'> & {
                recipients: Record<string, Version3RecipientDetail>
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
                    const newType: Version3PostDBRecord['recipients'] = {}
                    if (oldType !== undefined)
                        for (const each of oldType) {
                            newType[each.toText()] = { reason: [{ type: 'direct', at: new Date(0) }] }
                        }
                    const next: Version3PostDBRecord = {
                        ...cursor.value,
                        recipients: newType,
                        postBy: ProfileIdentifier.unknown,
                        foundAt: new Date(0),
                        recipientGroups: [],
                    }
                    cursor.update((next as Version3PostDBRecord) as any)
                }
            }

            /**
             * In the version 3 we use `recipients?: Record<string, RecipientDetail>`
             * After upgrade to version 4, we use `recipients: IdentifierMap<ProfileIdentifier, RecipientDetail>`
             */
            if (oldVersion <= 3) {
                const store = transaction.objectStore('post')
                for await (const cursor of store) {
                    const oldType = (cursor.value as unknown) as Version3PostDBRecord
                    const newType: PostDBRecord['recipients'] = new Map()
                    for (const [key, value] of Object.entries(oldType.recipients)) {
                        newType.set(key, value)
                    }
                    const next: PostDBRecord = {
                        ...cursor.value,
                        recipients: newType,
                    }
                    cursor.update(next)
                }
            }
        },
    })
})
export const PostDBAccess = db

type PostTransaction = IDBPTransaction<PostDB, ['post']>
export async function createPostDB(record: PostRecord, t?: PostTransaction) {
    t = t || (await db()).transaction('post', 'readwrite')
    const toSave = postToDB(record)
    await t.objectStore('post').add(toSave)
}
export async function updatePostDB(
    updateRecord: Partial<PostRecord> & Pick<PostRecord, 'identifier'>,
    mode: 'append' | 'override',
    t?: PostTransaction,
): Promise<void> {
    t = t || (await db()).transaction('post', 'readwrite')
    const emptyRecord: PostRecord = {
        identifier: updateRecord.identifier,
        recipients: new IdentifierMap(new Map()),
        postBy: ProfileIdentifier.unknown,
        foundAt: new Date(),
        recipientGroups: [],
    }
    const currentRecord = (await queryPostDB(updateRecord.identifier, t)) || emptyRecord
    const nextRecord: PostRecord = { ...currentRecord, ...updateRecord }
    const nextRecipients: PostDBRecord['recipients'] =
        mode === 'override' ? postToDB(nextRecord).recipients : postToDB(currentRecord).recipients
    if (mode === 'append') {
        if (updateRecord.recipients) {
            for (const [id, patchDetail] of updateRecord.recipients) {
                const idText = id.toText()
                if (nextRecipients.has(idText)) {
                    const { reason, ...rest } = patchDetail
                    const nextDetail = nextRecipients.get(idText)!
                    Object.assign(nextDetail, rest)
                    nextDetail.reason = [...nextDetail.reason, ...patchDetail.reason]
                } else {
                    nextRecipients.set(idText, patchDetail)
                }
            }
        }
    }
    const nextRecordInDBType = postToDB(nextRecord)
    await t.objectStore('post').put(nextRecordInDBType)
}
export async function createOrUpdatePostDB(record: PostRecord, mode: 'append' | 'override', t?: PostTransaction) {
    t = t || (await db()).transaction('post', 'readwrite')
    if (await t.objectStore('post').get(record.identifier.toText())) return updatePostDB(record, mode, t)
    else return createPostDB(record, t)
}
export async function queryPostDB(record: PostIVIdentifier, t?: PostTransaction): Promise<PostRecord | null> {
    t = t || (await db()).transaction('post')
    const result = await t.objectStore('post').get(record.toText())
    if (result) return postOutDB(result)
    return null
}
export async function queryPostsDB(
    query: string | ((data: PostRecord, id: PostIVIdentifier) => boolean),
    t?: PostTransaction,
): Promise<PostRecord[]> {
    t = t || (await db()).transaction('post')
    const selected: PostRecord[] = []
    for await (const { value } of t.store) {
        const idResult = Identifier.fromString(value.identifier, PostIVIdentifier)
        if (idResult.err) {
            console.warn(idResult.val.message)
            continue
        }
        const id = idResult.val
        if (typeof query === 'string') {
            if (id.network === query) selected.push(postOutDB(value))
        } else {
            const v = postOutDB(value)
            if (query(v, id)) selected.push(v)
        }
    }
    return selected
}
export async function deletePostCryptoKeyDB(record: PostIVIdentifier, t?: PostTransaction) {
    t = t || (await db()).transaction('post', 'readwrite')
    await t.objectStore('post').delete(record.toText())
}

//#region db in and out
function postOutDB(db: PostDBRecord): PostRecord {
    const { identifier, foundAt, postBy, recipientGroups, recipients, postCryptoKey } = db
    for (const detail of recipients.values()) {
        detail.reason.forEach(x => x.type === 'group' && restorePrototype(x.group, GroupIdentifier.prototype))
    }
    return {
        identifier: Identifier.fromString(identifier, PostIVIdentifier).unwrap(),
        recipientGroups: restorePrototypeArray(recipientGroups, GroupIdentifier.prototype),
        postBy: restorePrototype(postBy, ProfileIdentifier.prototype),
        recipients: new IdentifierMap(recipients, ProfileIdentifier),
        foundAt: foundAt,
        postCryptoKey: postCryptoKey,
    }
}
function postToDB(out: PostRecord): PostDBRecord {
    return {
        ...out,
        identifier: out.identifier.toText(),
        recipients: out.recipients.__raw_map__,
    }
}
//#endregion

//#region types
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
export interface PostRecord {
    /**
     * For old data stored before version 3, this identifier may be ProfileIdentifier.unknown
     */
    postBy: ProfileIdentifier
    identifier: PostIVIdentifier

    /**
     * ! This MUST BE a native CryptoKey
     */
    postCryptoKey?: CryptoKey
    /**
     * Receivers
     */
    recipients: IdentifierMap<ProfileIdentifier, RecipientDetail>
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

interface PostDBRecord extends Omit<PostRecord, 'postBy' | 'identifier' | 'recipients' | 'recipientGroups'> {
    postBy: PrototypeLess<ProfileIdentifier>
    identifier: string
    recipients: Map<string, RecipientDetail>
    recipientGroups: PrototypeLess<GroupIdentifier>[]
}

interface PostDB extends DBSchema {
    /** Use inline keys */
    post: {
        value: PostDBRecord
        key: string
    }
}
//#endregion
