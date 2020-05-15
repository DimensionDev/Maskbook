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
    return openDB<WalletDB>('maskbook-plugin-wallet', 1, {
        upgrade(db, oldVersion, newVersion, tx) {
            function v0_v1() {
                db.createObjectStore('GitcoinDonation', {
                    keyPath: path<keyof GitcoinDonationRecordInDatabase>('donation_transaction_hash'),
                })
                db.createObjectStore('RedPacket', { keyPath: path<keyof RedPacketRecordInDatabase>('id') })
                db.createObjectStore('ERC20Token', { keyPath: path<keyof WalletRecordInDatabase>('address') })
                db.createObjectStore('Wallet', { keyPath: path<keyof WalletRecordInDatabase>('address') })
                tx.objectStore('RedPacket').createIndex('red_packet_id', 'red_packet_id', { unique: true })
            }
            if (oldVersion < 1) v0_v1()
        },
    })
})

export interface WalletDB extends DBSchema {
    GitcoinDonation: {
        value: GitcoinDonationRecordInDatabase
        key: string
    }
    RedPacket: {
        value: RedPacketRecordInDatabase
        key: string
        indexes: {
            red_packet_id: string
        }
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
