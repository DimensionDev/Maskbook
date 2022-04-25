import {
    AESCryptoKey,
    AESJsonWebKey,
    ECKeyIdentifier,
    Identifier,
    IdentifierMap,
    PersonaIdentifier,
    PostIdentifier,
    PostIVIdentifier,
    ProfileIdentifier,
} from '@masknet/shared-base'
import { openDB } from 'idb/with-async-ittr'
import { CryptoKeyToJsonWebKey } from '../../../utils-pure'
import type { PersonaIdentifierStoredInDB, ProfileIdentifierStoredInDB } from '../persona/type'
import { createDBAccessWithAsyncUpgrade, createTransaction } from '../utils/openDB'
import type {
    RecipientReason,
    PostRecord,
    PostDB,
    PostDBRecord,
    PostReadOnlyTransaction,
    PostReadWriteTransaction,
} from './type'

type UpgradeKnowledge = { version: 4; data: Map<string, AESJsonWebKey> } | undefined
const db = createDBAccessWithAsyncUpgrade<PostDB, UpgradeKnowledge>(
    4,
    7,
    (currentTryOpen, knowledge) =>
        openDB<PostDB>('maskbook-post-v2', currentTryOpen, {
            async upgrade(db, oldVersion, _newVersion, transaction): Promise<void> {
                type Version2PostRecord = {
                    postBy: ProfileIdentifierStoredInDB | undefined
                    identifier: string
                    recipientGroups?: unknown
                    recipients?: ProfileIdentifierStoredInDB[]
                    foundAt: Date
                    postCryptoKey?: CryptoKey
                }
                type Version3RecipientDetail = {
                    /** Why they're able to receive this message? */
                    reason: RecipientReason[]
                }
                type Version3PostRecord = Omit<Version2PostRecord, 'recipients'> & {
                    recipients: Record<string, Version3RecipientDetail>
                }
                type Version4PostRecord = Omit<Version3PostRecord, 'recipients'> & {
                    recipients: Map<string, Version3RecipientDetail>
                }
                type Version5PostRecord = Omit<Version4PostRecord, 'postCryptoKey' | 'recipients'> & {
                    postCryptoKey?: AESJsonWebKey
                    encryptBy?: PersonaIdentifierStoredInDB
                    url?: string
                    summary?: string
                    interestedMeta?: ReadonlyMap<string, unknown>
                    recipients: true | Map<string, Version3RecipientDetail>
                }
                type Version6PostRecord = Omit<Version5PostRecord, 'encryptBy'> & {
                    encryptBy?: string
                }
                /**
                 * A type assert that make sure a and b are the same type
                 * @param a The latest version PostRecord
                 */
                function _assert(a: Version6PostRecord, b: PostDBRecord) {
                    a = b
                    b = a
                }
                // Prevent unused code removal
                // eslint-disable-next-line no-constant-condition
                if (1 + 1 === 3) _assert({} as any, {} as any)
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
                        const id = Identifier.fromString(each.identifier, PostIdentifier)
                        if (id.ok) {
                            const { postId, identifier } = id.val
                            each.identifier = new PostIVIdentifier(
                                (identifier as ProfileIdentifier).network,
                                postId,
                            ).toText()
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
                        const v2record: Version2PostRecord = cursor.value as any
                        const oldType = v2record.recipients
                            ?.map((x) => ProfileIdentifier.of(x.network, x.userId).unwrapOr(null!))
                            .filter(Boolean)
                        const newType: Version3PostRecord['recipients'] = {}
                        if (oldType !== undefined)
                            for (const each of oldType) {
                                newType[each.toText()] = { reason: [{ type: 'direct', at: new Date(0) }] }
                            }
                        const next: Version3PostRecord = {
                            ...v2record,
                            recipients: newType,
                            postBy: undefined,
                            foundAt: new Date(0),
                            recipientGroups: [],
                        }
                        await cursor.update(next as Version3PostRecord as any)
                    }
                }

                /**
                 * In the version 3 we use `recipients?: Record<string, RecipientDetail>`
                 * After upgrade to version 4, we use `recipients: IdentifierMap<ProfileIdentifier, RecipientDetail>`
                 */
                if (oldVersion <= 3) {
                    const store = transaction.objectStore('post')
                    for await (const cursor of store) {
                        const v3Record: Version3PostRecord = cursor.value as any
                        const newType: Version4PostRecord['recipients'] = new Map()
                        for (const [key, value] of Object.entries(v3Record.recipients)) {
                            newType.set(key, value)
                        }
                        const v4Record: Version4PostRecord = {
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
                        const v4Record: Version4PostRecord = cursor.value as any
                        const data = knowledge?.data!
                        if (!v4Record.postCryptoKey) continue
                        const v5Record: Version5PostRecord = {
                            ...v4Record,
                            postCryptoKey: data.get(v4Record.identifier)!,
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
                        const v5Record: Version5PostRecord = cursor.value as any
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
)
export const PostDBAccess = db
export async function withPostDBTransaction(task: (t: PostReadWriteTransaction) => Promise<void>) {
    const t = createTransaction(await PostDBAccess(), 'readwrite')('post')
    await task(t)
}

export async function createPostDB(record: PostRecord, t?: PostReadWriteTransaction) {
    t ||= createTransaction(await db(), 'readwrite')('post')
    const toSave = postToDB(record)
    await t.objectStore('post').add(toSave)
}
export async function updatePostDB(
    updateRecord: Partial<PostRecord> & Pick<PostRecord, 'identifier'>,
    mode: 'append' | 'override',
    t?: PostReadWriteTransaction,
): Promise<void> {
    t ||= createTransaction(await db(), 'readwrite')('post')
    const emptyRecord: PostRecord = {
        identifier: updateRecord.identifier,
        recipients: new IdentifierMap(new Map()),
        postBy: undefined,
        foundAt: new Date(),
    }
    const currentRecord = (await queryPostDB(updateRecord.identifier, t)) || emptyRecord
    const nextRecord: PostRecord = { ...currentRecord, ...updateRecord }
    const nextRecipients: PostDBRecord['recipients'] =
        mode === 'override' ? postToDB(nextRecord).recipients : postToDB(currentRecord).recipients
    if (mode === 'append') {
        if (updateRecord.recipients) {
            if (typeof updateRecord.recipients === 'object' && typeof nextRecipients === 'object') {
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
            } else {
                nextRecord.recipients = 'everyone'
            }
        }
    }
    const nextRecordInDBType = postToDB(nextRecord)
    await t.objectStore('post').put(nextRecordInDBType)
}

export async function queryPostDB(record: PostIVIdentifier, t?: PostReadOnlyTransaction): Promise<PostRecord | null> {
    t ||= createTransaction(await db(), 'readonly')('post')
    const result = await t.objectStore('post').get(record.toText())
    if (result) return postOutDB(result)
    return null
}
export async function queryPostsDB(
    query: string | ((data: PostRecord, id: PostIVIdentifier) => boolean),
    t?: PostReadOnlyTransaction,
): Promise<PostRecord[]> {
    t ||= createTransaction(await db(), 'readonly')('post')
    const selected: PostRecord[] = []
    for await (const { value } of t.objectStore('post')) {
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

/**
 * Query posts by paged
 */
export async function queryPostPagedDB(
    linked: PersonaIdentifier,
    options: {
        network: string
        userIds: string[]
        after?: PostIVIdentifier
        page?: number
    },
    count: number,
) {
    const t = createTransaction(await db(), 'readonly')('post')

    const data: PostRecord[] = []
    let firstRecord = true

    for await (const cursor of t.objectStore('post').iterate()) {
        if (cursor.value.encryptBy !== linked.toText()) continue
        if (!cursor.value.postBy) continue
        if (!options.userIds.includes(cursor.value.postBy.userId)) continue

        const postIdentifier = Identifier.fromString(cursor.value.identifier, PostIVIdentifier).unwrap()
        if (postIdentifier.network !== options.network) continue

        if (firstRecord && options.after) {
            cursor.continue(options.after.toText())
            firstRecord = false
            continue
        }

        if (postIdentifier === options.after) continue

        if (count <= 0) break
        const outData = postOutDB(cursor.value)
        count -= 1
        data.push(outData)
    }
    return data
}

// #region db in and out
function postOutDB(db: PostDBRecord): PostRecord {
    const { identifier, foundAt, postBy, recipients, postCryptoKey, encryptBy, interestedMeta, summary, url } = db
    return {
        identifier: Identifier.fromString(identifier, PostIVIdentifier).unwrap(),
        postBy: ProfileIdentifier.of(postBy?.network, postBy?.userId).unwrapOr(undefined),
        recipients: recipients === true ? 'everyone' : new IdentifierMap(recipients, ProfileIdentifier),
        foundAt: foundAt,
        postCryptoKey: postCryptoKey,
        encryptBy: encryptBy ? ECKeyIdentifier.from(encryptBy).unwrapOr(undefined) : undefined,
        interestedMeta,
        summary,
        url,
    }
}
function postToDB(out: PostRecord): PostDBRecord {
    return {
        ...out,
        identifier: out.identifier.toText(),
        recipients: out.recipients === 'everyone' ? true : out.recipients.__raw_map__,
        encryptBy: out.encryptBy?.toText(),
    }
}
// #endregion
