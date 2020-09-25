import { DBSchema, openDB } from 'idb/with-async-ittr-cjs'
import { createDBAccess, createTransaction } from '../../../database/helpers/openDB'
import type { ERC20TokenRecord, WalletRecordInDatabase } from './types'
import type { RedPacketRecordInDatabase } from '../../RedPacket/types'
import { RedPacketPluginID } from '../../RedPacket/constants'
import { checksumAddress } from './helpers'
import { sideEffect } from '../../../utils/side-effects'
import { migratePluginDatabase } from './migrate.plugins'

function path<T>(x: T) {
    return x
}
export const createWalletDBAccess = createDBAccess(() => {
    return openDB<WalletDB>('maskbook-plugin-wallet', 4, {
        async upgrade(db, oldVersion, newVersion, tx) {
            function v0_v1() {
                // @ts-expect-error
                db.createObjectStore('RedPacket', { keyPath: path<keyof RedPacketRecordInDatabase>('id') })
                db.createObjectStore('ERC20Token', { keyPath: path<keyof WalletRecordInDatabase>('address') })
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
                    const id = RedPacketPluginID
                    os.add({
                        plugin_id: id,
                        record_id: `${id}:${each.id}`,
                        value: each,
                        // @ts-ignore
                        0: each.red_packet_id,
                    })
                }
                // @ts-ignore
                db.deleteObjectStore('GitcoinDonation')
                // @ts-ignore
                db.deleteObjectStore('RedPacket')
            }
            /**
             * Use checksummed address in DB
             */
            async function v3_v4() {
                const t = createTransaction(db, 'readwrite')('Wallet', 'ERC20Token')
                const wallets = t.objectStore('Wallet')
                const tokens = t.objectStore('ERC20Token')
                for await (const wallet of wallets) {
                    // update address
                    wallet.value.address = checksumAddress(wallet.value.address)

                    // update erc20_token_balance map
                    const entries = Array.from(wallet.value.erc20_token_balance.entries())
                    wallet.value.erc20_token_balance.clear()
                    for (const [key, value] of entries) {
                        wallet.value.erc20_token_balance.set(checksumAddress(key), value)
                    }

                    // update token list sets
                    ;[wallet.value.erc20_token_blacklist, wallet.value.erc20_token_whitelist].forEach((set) => {
                        const values = Array.from(set.values())
                        set.clear()
                        values.forEach((value) => set.add(checksumAddress(value)))
                    })
                    await wallet.update(wallet.value)
                }
                for await (const token of tokens) {
                    token.value.address = checksumAddress(token.value.address)
                    await token.update(token.value)
                }
            }

            if (oldVersion < 1) v0_v1()
            if (oldVersion < 2) v1_v2()
            if (oldVersion < 3) await v2_v3()
            if (oldVersion < 4) await v3_v4()
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
        value: ERC20TokenRecord
        key: string
    }
}
