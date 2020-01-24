import { DBSchema, openDB } from 'idb/with-async-ittr'
import { createDBAccess } from '../../../database/helpers/openDB'
import { RedPacketRecord, WalletRecord, ERC20TokenRecord } from './types'

function path<T>(x: T) {
    return x
}
export const createWalletDBAccess = createDBAccess(() => {
    return openDB<WalletDB>('maskbook-plugin-wallet', 1, {
        upgrade(db, oldVersion, newVersion, tx) {
            function v0_v1() {
                db.createObjectStore('RedPacket', { keyPath: path<keyof RedPacketRecord>('id') })
                db.createObjectStore('ERC20Token', { keyPath: path<keyof ERC20TokenRecord>('address') })
                db.createObjectStore('Wallet', { keyPath: path<keyof WalletRecord>('address') })
                // db.createObjectStore('WalletToken', { keyPath: 'id' })
                tx.objectStore('RedPacket').createIndex('red_packet_id', 'red_packet_id', { unique: true })
            }
            if (oldVersion < 1) v0_v1()
        },
    })
})

export interface WalletDB extends DBSchema {
    RedPacket: {
        value: RedPacketRecord
        key: string
        indexes: {
            red_packet_id: string
        }
    }
    Wallet: {
        value: WalletRecord
        key: string
        indexes: {
            // address: string
        }
    }
    ERC20Token: {
        value: ERC20TokenRecord
        key: string
        indexes: {
            // address: string
        }
    }
    // WalletToken: {
    //     value: WalletTokenRecord
    //     key: string
    // }
}
