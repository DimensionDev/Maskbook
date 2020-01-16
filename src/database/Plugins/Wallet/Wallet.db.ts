/// <reference path="../../global.d.ts" />

import { DBSchema, openDB } from 'idb/with-async-ittr'
import { createDBAccess } from '../../helpers/openDB'
import { RedPacketRecord, WalletRecord, ERC20TokenRecord, WalletTokenRecord } from './types'

export const createWalletDBAccess = createDBAccess(() => {
    return openDB<WalletDB>('maskbook-plugin-wallet', 1, {
        upgrade(db, oldVersion) {
            function v0_v1() {
                db.createObjectStore('RedPacket', { keyPath: 'id' })
                db.createObjectStore('ERC20Token', { keyPath: 'id' })
                db.createObjectStore('Wallet', { keyPath: 'id' })
                db.createObjectStore('WalletToken', { keyPath: 'id' })
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
            address: string
        }
    }
    ERC20Token: {
        value: ERC20TokenRecord
        key: string
    }
    WalletToken: {
        value: WalletTokenRecord
        key: string
    }
}
