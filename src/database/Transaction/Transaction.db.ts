import type { TransactionConfig } from 'web3-core'
import { openDB, DBSchema } from 'idb/with-async-ittr-cjs'
import { createDBAccess } from '../helpers/openDB'
import type Transaction from 'arweave/web/lib/transaction'
import type { PartialBy } from '../../utils/type'

export interface TransactionRecord {
    hash: string
    config: TransactionConfig
    meta: {
        name?: string
        args?: string[]
    }
    createdAt: Date
    updatedAt: Date
}

export interface TransactionRecordDB extends TransactionRecord {
    config: Omit<TransactionConfig, 'common'>
}

export interface TransactionDBSchema extends DBSchema {
    transactions: {
        value: TransactionRecord
        key: string
        indexes: {
            hash: string
        }
    }
}

const createTransactionDBAccess = createDBAccess(() => {
    return openDB<TransactionDBSchema>('maskbook-transaction', 1, {
        upgrade(db, oldVersion, newVersion, tx) {
            function v0_v1() {
                db.createObjectStore('transactions', { keyPath: 'hash' })
                tx.objectStore('transactions').createIndex('hash', 'hash', { unique: true })
            }
            if (oldVersion < 1) v0_v1()
        },
    })
})

export async function createTransactionDB(
    hash: string,
    config: TransactionConfig,
    meta: {
        name?: string
        args?: string[]
    } = {},
) {
    const t = (await createTransactionDBAccess()).transaction(['transactions'], 'readwrite')
    await t.objectStore('transactions').add(
        transactionRecordToDB({
            hash,
            config,
            meta,
            createdAt: new Date(),
            updatedAt: new Date(),
        }),
    )
}

export async function deleteTransactionDB(hash: string) {
    const t = (await createTransactionDBAccess()).transaction(['transactions'], 'readwrite')
    await t.objectStore('transactions').delete(hash)
}

export async function queryTrasnactionDB(hash: string) {
    return (await queryAllTransactionsDB()).filter((x) => x.hash === hash)
}

export async function advancedQueryTransactionDB(conditions: Partial<Record<'hash' | 'from' | 'to' | 'name', string>>) {
    return (await queryAllTransactionsDB()).filter((x) =>
        Object.keys(conditions).every((key_) => {
            const key = key_ as keyof typeof conditions
            if (key === 'hash') return x.hash === conditions[key]
            if (key === 'from') return x.config.from === conditions[key]
            if (key === 'to') return x.config.to === conditions[key]
            if (key === 'name') return x.meta.name === conditions[key]
            return false
        }),
    )
}

export async function queryAllTransactionsDB() {
    const t = (await createTransactionDBAccess()).transaction(['transactions'], 'readonly')
    return (await t.objectStore('transactions').getAll()).map(transactionRecordOutDB)
}

function transactionRecordToDB(record: TransactionRecord): TransactionRecordDB {
    delete record.config.common
    return record as TransactionRecordDB
}

function transactionRecordOutDB(x: TransactionRecordDB): TransactionRecord {
    return x as TransactionRecord
}
