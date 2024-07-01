import { type DBSchema, openDB } from 'idb'
import { createDBAccess } from '../../../database/utils/openDB.js'
import type { LegacyWalletRecordInDatabase, UnconfirmedRequestChunkRecordInDatabase } from './types.js'

function path<T>(x: T) {
    return x
}

export const createWalletDBAccess = createDBAccess(() => {
    return openDB<WalletDB>('maskbook-plugin-wallet', 9, {
        async upgrade(db, oldVersion, newVersion, tx) {
            function v0_v1() {
                db.createObjectStore('Wallet', { keyPath: path<keyof LegacyWalletRecordInDatabase>('address') })
            }
            function v8_v9() {
                const pluginStore = 'PluginStore'
                db.objectStoreNames.contains(pluginStore as any) && db.deleteObjectStore(pluginStore as any)
                db.createObjectStore('UnconfirmedRequestChunk', {
                    keyPath: path<keyof UnconfirmedRequestChunkRecordInDatabase>('record_id'),
                })
            }

            if (oldVersion < 1) v0_v1()
            if (oldVersion < 9) v8_v9()
        },
    })
})

interface WalletDB extends DBSchema {
    Wallet: {
        value: LegacyWalletRecordInDatabase
        key: string
    }
    UnconfirmedRequestChunk: {
        value: UnconfirmedRequestChunkRecordInDatabase
        key: string
    }
}
