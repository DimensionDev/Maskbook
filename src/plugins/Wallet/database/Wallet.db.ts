import { DBSchema, openDB } from 'idb/with-async-ittr-cjs'
import { createDBAccess } from '../../../database/helpers/openDB'
import type {
    ERC20TokenRecord,
    WalletRecordInDatabase,
    RedPacketRecordInDatabase,
    GitcoinDonationRecordInDatabase,
} from './types'

function path<T>(x: T) {
    return x
}
export const createWalletDBAccess = createDBAccess(() => {
    return openDB<WalletDB>('maskbook-plugin-wallet', 4, {
        async upgrade(db, oldVersion, newVersion, tx) {
            console.log('DEBUG: upgrade DB')
            console.log(`DEBUG: ${newVersion}`)
            function v0_v1() {
                // @ts-expect-error
                db.createObjectStore('RedPacket', { keyPath: path<keyof RedPacketRecordInDatabase>('id') })
                db.createObjectStore('ERC20Token', { keyPath: path<keyof WalletRecordInDatabase>('address') })
                db.createObjectStore('Wallet', { keyPath: path<keyof WalletRecordInDatabase>('address') })
            }
            function v1_v2() {
                // @ts-expect-error
                db.createObjectStore('GitcoinDonation', {
                    keyPath: path<keyof GitcoinDonationRecordInDatabase>('donation_transaction_hash'),
                })
            }
            /**
             * The following store has been removed from v3
             * GitcoinDonation: {
             *     value: GitcoinDonationRecordInDatabase
             *     key: string
             * }
             * RedPacket: {
             *     value: RedPacketRecordInDatabase
             *     key: string
             *     indexes: {
             *         red_packet_id: string
             *     }
             * }
             */
            async function v2_v3() {
                const os = db.createObjectStore('PluginStore', { keyPath: 'record_id' })
                // @ts-ignore
                os.createIndex('0', 'index0')
                // @ts-ignore
                os.createIndex('1', 'index1')
                // @ts-ignore
                os.createIndex('2', 'index2')
                os.createIndex('plugin_id', 'plugin_id')
                // @ts-expect-error
                const redPacket: RedPacketRecordInDatabase[] = await db.getAll('RedPacket')
                for (const each of redPacket) {
                    const id = 'com.maskbook.redpacket'
                    os.add({
                        plugin_id: id,
                        record_id: `${id}:${each.id}`,
                        value: each,
                        // @ts-ignore
                        0: each.red_packet_id,
                    })
                }
                // @ts-expect-error
                const gitcoin: GitcoinDonationRecordInDatabase[] = await db.getAll('GitcoinDonation')
                for (const each of gitcoin) {
                    const id = 'com.maskbook.provide.co.gitcoin'
                    os.add({
                        plugin_id: id,
                        record_id: `${id}:${each.donation_transaction_hash}`,
                        value: each,
                    })
                }
                // @ts-ignore
                db.deleteObjectStore('GitcoinDonation')
                // @ts-ignore
                db.deleteObjectStore('RedPacket')
            }
            /**
             * add new fields
             *  erc20_token_whitelist
             *  erc20_token_blacklist
             */
            async function v3_v4() {
                console.log('DEBUG: upgrade db v3_v4')
                const store = tx.objectStore('Wallet')
                const old = await store.getAll()
                await store.clear()
                for (const each of old) {
                    each.erc20_token_whitelist = new Set()
                    each.erc20_token_blacklist = new Set()
                    await store.add(each)
                }
            }
            if (oldVersion < 1) v0_v1()
            if (oldVersion < 2) v1_v2()
            if (oldVersion < 3) await v2_v3()
            if (oldVersion < 4) await v3_v4()
        },
    })
})
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
        value: ERC20TokenRecord
        key: string
    }
}
