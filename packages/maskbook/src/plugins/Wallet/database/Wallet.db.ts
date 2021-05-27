import { DBSchema, openDB } from 'idb/with-async-ittr-cjs'
import { createDBAccess } from '../../../database/helpers/openDB'
import type {
    ERC1155TokenRecordInDatabase,
    ERC20TokenRecordInDatabase,
    ERC721TokenRecordInDatabase,
    PhraseRecordInDatabase,
    TransactionChunkRecordInDatabase,
    WalletRecordInDatabase,
} from './types'
import { sideEffect } from '../../../utils/side-effects'
import { migratePluginDatabase } from './migrate.plugins'

function path<T>(x: T) {
    return x
}

export const createWalletDBAccess = createDBAccess(() => {
    return openDB<WalletDB>('maskbook-plugin-wallet', 8, {
        async upgrade(db, oldVersion, newVersion, tx) {
            function v0_v1() {
                db.createObjectStore('ERC20Token', { keyPath: path<keyof ERC20TokenRecordInDatabase>('address') })
                db.createObjectStore('Wallet', { keyPath: path<keyof WalletRecordInDatabase>('address') })
            }
            function v2_v3() {
                const os = db.createObjectStore('PluginStore', { keyPath: 'record_id' })
                // @ts-ignore
                os.createIndex('0', 'index0')
                // @ts-ignore
                os.createIndex('1', 'index1')
                // @ts-ignore
                os.createIndex('2', 'index2')
                os.createIndex('plugin_id', 'plugin_id')
            }
            function v5_v6() {
                db.createObjectStore('ERC721Token', { keyPath: path<keyof ERC721TokenRecordInDatabase>('record_id') })
                db.createObjectStore('ERC1155Token', { keyPath: path<keyof ERC1155TokenRecordInDatabase>('record_id') })
            }
            function v6_v7() {
                db.createObjectStore('Phrase', { keyPath: path<keyof PhraseRecordInDatabase>('id') })
            }
            function v7_v8() {
                db.createObjectStore('TransactionChunk', {
                    keyPath: path<keyof TransactionChunkRecordInDatabase>('record_id'),
                })
            }

            if (oldVersion < 1) v0_v1()
            if (oldVersion < 3) v2_v3()
            if (oldVersion < 6) v5_v6()
            if (oldVersion < 7) v6_v7()
            if (oldVersion < 8) v7_v8()
        },
    })
})

sideEffect.then(migratePluginDatabase)
export interface WalletDB<Data = unknown, Indexes extends [IDBValidKey?, IDBValidKey?, IDBValidKey?] = []>
    extends DBSchema {
    // @ts-ignore
    PluginStore: {
        value: {
            plugin_id: string
            value: Data
            record_id: string
            '0'?: Indexes[0]
            '1'?: Indexes[1]
            '2'?: Indexes[2]
        }
        key: string
        indexes: Indexes & { plugin_id: string }
    }
    Phrase: {
        value: PhraseRecordInDatabase
        key: string
    }
    Wallet: {
        value: WalletRecordInDatabase
        key: string
    }
    TransactionChunk: {
        value: TransactionChunkRecordInDatabase
        key: string
    }
    ERC20Token: {
        value: ERC20TokenRecordInDatabase
        key: string
    }
    ERC721Token: {
        value: ERC721TokenRecordInDatabase
        key: string
    }
    ERC1155Token: {
        value: ERC1155TokenRecordInDatabase
        key: string
    }
}
