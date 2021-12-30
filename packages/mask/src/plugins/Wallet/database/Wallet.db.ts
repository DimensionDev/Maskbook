import { DBSchema, openDB } from 'idb/with-async-ittr'
import { createDBAccess } from '../../../../background/database/utils/openDB'
import type {
    ERC1155TokenRecordInDatabase,
    ERC20TokenRecordInDatabase,
    TransactionChunkRecordInDatabase,
    UnconfirmedRequestChunkRecordInDatabase,
    LegacyWalletRecordInDatabase,
} from './types'
import type { ERC721TokenRecordInDatabase } from '@masknet/web3-shared-evm'

function path<T>(x: T) {
    return x
}

export const createWalletDBAccess = createDBAccess(() => {
    return openDB<WalletDB>('maskbook-plugin-wallet', 9, {
        async upgrade(db, oldVersion, newVersion, tx) {
            function v0_v1() {
                db.createObjectStore('ERC20Token', { keyPath: path<keyof ERC20TokenRecordInDatabase>('address') })
                db.createObjectStore('Wallet', { keyPath: path<keyof LegacyWalletRecordInDatabase>('address') })
            }
            function v5_v6() {
                db.createObjectStore('ERC721Token', { keyPath: path<keyof ERC721TokenRecordInDatabase>('record_id') })
                db.createObjectStore('ERC1155Token', { keyPath: path<keyof ERC1155TokenRecordInDatabase>('record_id') })
            }
            function v7_v8() {
                db.createObjectStore('TransactionChunk', {
                    keyPath: path<keyof TransactionChunkRecordInDatabase>('record_id'),
                })
            }
            function v8_v9() {
                const pluginStore = 'PluginStore'
                db.objectStoreNames.contains(pluginStore as any) && db.deleteObjectStore(pluginStore as any)
                db.createObjectStore('UnconfirmedRequestChunk', {
                    keyPath: path<keyof UnconfirmedRequestChunkRecordInDatabase>('record_id'),
                })
            }

            if (oldVersion < 1) v0_v1()
            if (oldVersion < 6) v5_v6()
            if (oldVersion < 8) v7_v8()
            if (oldVersion < 9) v8_v9()
        },
    })
})

export interface WalletDB extends DBSchema {
    Wallet: {
        value: LegacyWalletRecordInDatabase
        key: string
    }
    TransactionChunk: {
        value: TransactionChunkRecordInDatabase
        key: string
    }
    UnconfirmedRequestChunk: {
        value: UnconfirmedRequestChunkRecordInDatabase
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
