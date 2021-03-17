import { DBSchema, openDB } from 'idb/with-async-ittr-cjs'
import { createDBAccess } from '../../../database/helpers/openDB'
import type { ERC20TokenRecordInDatabase, ERC721TokenRecordInDatabase, WalletRecordInDatabase } from './types'
import type { RedPacketRecordInDatabase } from '../../RedPacket/types'
import { sideEffect } from '../../../utils/side-effects'
import { migratePluginDatabase } from './migrate.plugins'

function path<T>(x: T) {
    return x
}
export const createWalletDBAccess = createDBAccess(() => {
    return openDB<WalletDB>('maskbook-plugin-wallet', 6, {
        async upgrade(db, oldVersion, newVersion, tx) {
            function v0_v1() {
                // @ts-expect-error
                db.createObjectStore('RedPacket', { keyPath: path<keyof RedPacketRecordInDatabase>('id') })
                db.createObjectStore('ERC20Token', { keyPath: path<keyof ERC20TokenRecordInDatabase>('address') })
                db.createObjectStore('Wallet', { keyPath: path<keyof WalletRecordInDatabase>('address') })
            }
            function v1_v2() {
                // @ts-expect-error
                db.createObjectStore('GitcoinDonation', { keyPath: 'donation_transaction_hash' })
            }
            /**
             * The following store has been removed from v3
             * GitcoinDonation: { % data dropped % }
             * RedPacket: {
             *     value: RedPacketRecordInDatabase
             *     key: string
             *     indexes: {
             *         red_packet_id: string
             *     }
             * }
             */
            function v2_v3() {
                const os = db.createObjectStore('PluginStore', { keyPath: 'record_id' })
                // @ts-ignore
                os.createIndex('0', 'index0')
                // @ts-ignore
                os.createIndex('1', 'index1')
                // @ts-ignore
                os.createIndex('2', 'index2')
                os.createIndex('plugin_id', 'plugin_id')
                // @ts-ignore
                db.deleteObjectStore('GitcoinDonation')
                // @ts-ignore
                db.deleteObjectStore('RedPacket')
            }

            /**
             * Store ERC721Token records in DB
             */
            function v5_v6() {
                db.createObjectStore('ERC721Token', { keyPath: path<keyof ERC721TokenRecordInDatabase>('record_id') })
            }

            if (oldVersion < 1) v0_v1()
            if (oldVersion < 2) v1_v2()
            if (oldVersion < 3) v2_v3()
            if (oldVersion < 6) v5_v6()
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
    Wallet: {
        value: WalletRecordInDatabase
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
}
