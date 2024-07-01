import {
    type AESCryptoKey,
    type AESJsonWebKey,
    ECKeyIdentifier,
    PostIdentifier,
    PostIVIdentifier,
    ProfileIdentifier,
} from '@masknet/shared-base'
import { openDB } from 'idb'
import { CryptoKeyToJsonWebKey } from '../../../utils-pure/index.js'
import { createDBAccessWithAsyncUpgrade, createTransaction } from '../utils/openDB.js'
import type { PostRecord, PostDB, PostReadOnlyTransaction, PostReadWriteTransaction } from './type.js'
import type { PostDB_HistoryTypes, LatestPostDBRecord, LatestRecipientDetailDB } from './dbType.js'

type UpgradeKnowledge =
    | {
          version: 4
          data: Map<string, AESJsonWebKey>
      }
    | undefined
const db = createDBAccessWithAsyncUpgrade<PostDB, UpgradeKnowledge>(
    4,
    7,
    (currentTryOpen, knowledge) =>
        openDB<PostDB>('maskbook-post-v2', currentTryOpen, {
            async upgrade(db, oldVersion, _newVersion, transaction): Promise<void> {
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
                    const old = await store.getAll()
                    await store.clear()
                    for (const each of old) {
                        const id = PostIdentifier.from(each.identifier)
                        if (id.isSome()) {
                            const { postId, identifier } = id.value
                            each.identifier = new PostIVIdentifier(identifier.network, postId).toText()
                            await store.add(each)
                        }
                    }
                }

                /**
                 * In the version 2 we use `recipients?: ProfileIdentifier[]`
                 * After upgrade to version 3, we use `recipients: Record<string, RecipientDetail>`
                 */
                if (oldVersion <= 2) {
                    const store = transaction.objectStore('post')
                    for await (const cursor of store) {
                        const v2record: PostDB_HistoryTypes.Version2PostRecord = cursor.value as any
                        const oldType = v2record.recipients
                            ?.map((x) => ProfileIdentifier.of(x.network, x.userId).unwrapOr(null!))
                            .filter(Boolean)
                        const newType: PostDB_HistoryTypes.Version3PostRecord['recipients'] = {}
                        if (oldType !== undefined)
                            for (const each of oldType) {
                                newType[each.toText()] = { reason: [{ type: 'direct', at: new Date(0) }] }
                            }
                        const next: PostDB_HistoryTypes.Version3PostRecord = {
                            ...v2record,
                            recipients: newType,
                            postBy: undefined,
                            foundAt: new Date(0),
                            recipientGroups: [],
                        }
                        await cursor.update(next satisfies PostDB_HistoryTypes.Version3PostRecord as any)
                    }
                }

                /**
                 * In the version 3 we use `recipients?: Record<string, RecipientDetail>`
                 * After upgrade to version 4, we use `recipients: Map<ProfileIdentifier, RecipientDetail>`
                 */
                if (oldVersion <= 3) {
                    const store = transaction.objectStore('post')
                    for await (const cursor of store) {
                        const v3Record: PostDB_HistoryTypes.Version3PostRecord = cursor.value as any
                        const newType: PostDB_HistoryTypes.Version4PostRecord['recipients'] = new Map()
                        for (const [key, value] of Object.entries(v3Record.recipients)) {
                            newType.set(key, value)
                        }
                        const v4Record: PostDB_HistoryTypes.Version4PostRecord = {
                            ...v3Record,
                            recipients: newType,
                        }
                        await cursor.update(v4Record as any)
                    }
                }
                /**
                 * In version 4 we use CryptoKey, in version 5 we use JsonWebKey
                 */
                if (oldVersion <= 4) {
                    const store = transaction.objectStore('post')
                    for await (const cursor of store) {
                        const v4Record: PostDB_HistoryTypes.Version4PostRecord = cursor.value as any
                        const data = knowledge?.data
                        if (!data) {
                            await cursor.delete()
                            continue
                        }
                        if (!v4Record.postCryptoKey) continue
                        const v5Record: PostDB_HistoryTypes.Version5PostRecord = {
                            ...v4Record,
                            postCryptoKey: data.get(v4Record.identifier),
                        }
                        if (!v5Record.postCryptoKey) delete v5Record.postCryptoKey
                        await cursor.update(v5Record as any)
                    }
                }

                // version 6 ships a wrong db migration.
                // therefore need to upgrade again to fix it.
                if (oldVersion <= 6) {
                    const store = transaction.objectStore('post')
                    for await (const cursor of store) {
                        const v5Record: PostDB_HistoryTypes.Version5PostRecord = cursor.value as any
                        const by = v5Record.encryptBy
                        // This is the correct data type
                        if (typeof by === 'string') continue
                        if (!by) continue
                        cursor.value.encryptBy = new ECKeyIdentifier(
                            by.curve,
                            by.compressedPoint || by.encodedCompressedKey!,
                        ).toText()
                        cursor.update(cursor.value)
                    }
                    if (!store.indexNames.contains('persona, date'))
                        store.createIndex('persona, date', ['encryptBy', 'foundAt'], { unique: false })
                }
            },
        }),
    async (db): Promise<UpgradeKnowledge> => {
        if (db.version === 4) {
            const map = new Map<string, AESJsonWebKey>()
            const knowledge: UpgradeKnowledge = { version: 4, data: map }
            const records = await createTransaction(db, 'readonly')('post').objectStore('post').getAll()
            for (const r of records) {
                const x = r.postCryptoKey
                if (!x) continue
                try {
                    const key = await CryptoKeyToJsonWebKey(x as any as AESCryptoKey)
                    map.set(r.identifier, key)
                } catch {
                    continue
                }
            }
            return knowledge
        }
        return undefined
    },
    'maskbook-post-v2',
)

const PostDBAccess = db

/** @internal */
export async function withPostDBTransaction(task: (t: PostReadWriteTransaction) => Promise<void>) {
    const t = createTransaction(await PostDBAccess(), 'readwrite')('post')
    await task(t)
}

/** @internal */
export async function createPostDB(record: PostRecord, t?: PostReadWriteTransaction): Promise<void> {
    t ||= createTransaction(await db(), 'readwrite')('post')
    const toSave = postToDB(record)
    await t.objectStore('post').add(toSave)
}

/** @internal */
export async function updatePostDB(
    updateRecord: Partial<PostRecord> & Pick<PostRecord, 'identifier'>,
    mode: 'append' | 'override',
    t?: PostReadWriteTransaction,
): Promise<void> {
    t ||= createTransaction(await db(), 'readwrite')('post')
    const emptyRecord: PostRecord = {
        identifier: updateRecord.identifier,
        recipients: new Map(),
        postBy: undefined,
        foundAt: new Date(),
    }
    const currentRecord = (await queryPostDB(updateRecord.identifier, t)) || emptyRecord
    const nextRecord: PostRecord = { ...currentRecord, ...updateRecord }
    const nextRecipients: LatestPostDBRecord['recipients'] =
        mode === 'override' ? postToDB(nextRecord).recipients : postToDB(currentRecord).recipients
    if (mode === 'append') {
        if (updateRecord.recipients) {
            if (typeof updateRecord.recipients === 'object' && typeof nextRecipients === 'object') {
                for (const [id, date] of updateRecord.recipients) {
                    nextRecipients.set(id.toText(), { reason: [{ at: date, type: 'direct' }] })
                }
            } else {
                nextRecord.recipients = 'everyone'
            }
        }
    }
    const nextRecordInDBType = postToDB(nextRecord)
    await t.objectStore('post').put(nextRecordInDBType)
}

/** @internal */
export async function queryPostDB(record: PostIVIdentifier, t?: PostReadOnlyTransaction): Promise<PostRecord | null> {
    t ||= createTransaction(await db(), 'readonly')('post')
    const result = await t.objectStore('post').get(record.toText())
    if (result) return postOutDB(result)
    return null
}

/** @internal */
export async function queryPostsDB(
    query: string | ((data: PostRecord, id: PostIVIdentifier) => boolean),
    t?: PostReadOnlyTransaction,
): Promise<PostRecord[]> {
    t ||= createTransaction(await db(), 'readonly')('post')
    const selected: PostRecord[] = []
    for await (const { value } of t.objectStore('post')) {
        const idResult = PostIVIdentifier.from(value.identifier)
        if (idResult.isNone()) {
            console.warn('Invalid identifier', value.identifier)
            continue
        }
        const id = idResult.value
        if (typeof query === 'string') {
            if (id.network === query) selected.push(postOutDB(value))
        } else {
            const v = postOutDB(value)
            if (query(v, id)) selected.push(v)
        }
    }
    return selected
}

function postOutDB(db: LatestPostDBRecord): PostRecord {
    const { identifier, foundAt, postBy, postCryptoKey, encryptBy, interestedMeta, summary, url } = db
    let recipients: PostRecord['recipients']
    if (db.recipients === true) {
        recipients = 'everyone'
    } else {
        recipients = new Map()
        for (const [id, { reason }] of db.recipients) {
            const identifier = ProfileIdentifier.from(id)
            if (identifier.isNone()) continue
            const detail = reason[0]
            if (!detail) continue
            recipients.set(identifier.value, detail.at)
        }
    }
    return {
        identifier: PostIVIdentifier.from(identifier).expect(
            `data stored in the post database should be a valid PostIVIdentifier, but found ${identifier}`,
        ),
        postBy: ProfileIdentifier.of(postBy?.network, postBy?.userId).unwrapOr(undefined),
        recipients,
        foundAt,
        postCryptoKey,
        encryptBy: ECKeyIdentifier.from(encryptBy).unwrapOr(undefined),
        interestedMeta,
        summary,
        url,
    }
}
function postToDB(out: PostRecord): LatestPostDBRecord {
    let recipients: LatestPostDBRecord['recipients']
    if (out.recipients === 'everyone') {
        recipients = true
    } else {
        const map = new Map<string, LatestRecipientDetailDB>()
        for (const [id, detail] of out.recipients) {
            map.set(id.toText(), { reason: [{ at: detail, type: 'direct' }] })
        }
        recipients = map
    }
    return {
        ...out,
        identifier: out.identifier.toText(),
        encryptBy: out.encryptBy?.toText(),
        recipients,
    }
}
