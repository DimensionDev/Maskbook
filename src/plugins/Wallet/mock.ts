import { RedPacketAPI, WalletAPI, RedPacketClaimResult, RedPacketCreationResult } from './types'
import { sleep } from '@holoflows/kit/es/util/sleep'
import { onClaimResult, onCreationResult, onExpired, onRefundResult } from './red-packet-fsm'
import { onWalletBalanceUpdated } from './wallet'
import { createTransaction } from '../../database/helpers/openDB'
import { createWalletDBAccess } from '../../database/Plugins/Wallet/Wallet.db'
import uuid from 'uuid/v4'

export const mockRedPacketAPI: RedPacketAPI = {
    dataSource: 'mock',
    async create(...args) {
        console.log('Mock: Calling create_red_packet', ...args)
        await sleep(1000)
        return { create_transaction_hash: 'create_transaction_hash', create_nonce: 123 }
    },
    async claim(...args) {
        console.log('Mock: Calling claiming', ...args)
        await sleep(1000)
        return { claim_transaction_hash: 'txhash' }
    },

    async watchClaimResult(id) {
        console.log('Mock: Watching calming result', id, 'Call globalThis.next(true / false) to approve / reject claim')
        const tx = await createTransaction(
            await createWalletDBAccess(),
            'readonly',
        )('RedPacket')
            .objectStore('RedPacket')
            .get(id.databaseID)
        Object.assign(globalThis, {
            next: (x: boolean) => {
                const r: RedPacketClaimResult = x
                    ? {
                          type: 'success',
                          claimed_value: BigInt(Math.ceil(Math.random() * 1000)),
                          claimer: 'claimer address',
                          red_packet_id: tx?.red_packet_id!,
                      }
                    : { type: 'failed' }
                onClaimResult(id, r)
            },
        })
    },
    async watchCreateResult(id) {
        console.log('Mock: Watching creation...', id, 'Call globalThis.next(true / false) to approve / reject create')
        Object.assign(globalThis, {
            next(x: boolean) {
                const f: RedPacketCreationResult = x
                    ? {
                          type: 'success',
                          block_creation_time: new Date(),
                          red_packet_id: uuid(),
                          creator: 'creator address',
                          total: BigInt(23),
                      }
                    : { type: 'failed', reason: 'uh.chuchuc' }
                onCreationResult(id, f)
            },
        })
    },
    async watchExpired(id) {
        console.log('Mock: watching expired', id, 'Call globalThis.next() to expire this red packet')
        Object.assign(globalThis, {
            next() {
                onExpired(id)
            },
        })
    },
    async checkAvailability(id) {
        console.log('Mock: checking availibity of the red packet')
        await sleep(2000)
        return {
            balance: BigInt(233),
            claimedCount: 5,
            expired: false,
            token_address: 'token address',
            totalCount: 10,
        }
    },
    async refund(id) {
        console.log('Mock: calling refund', id)
        return { refund_transaction_hash: 'transaction hash' }
    },
    watchRefundResult(id) {
        console.log('Mock: Watching refund result...', id, 'Call globalThis.next() to refund.')
        Object.assign(globalThis, {
            next() {
                onRefundResult(id, { remaining_balance: BigInt(10) })
            },
        })
    },
}

export const mockWalletAPI: WalletAPI = {
    dataSource: 'mock',
    watchWalletBalance(address) {
        setInterval(() => {
            onWalletBalanceUpdated(address, BigInt(Math.floor(Math.random() * 1000)))
        }, 4000)
    },
    addWalletPrivateKey(priv: string) {
        console.log('Adding privkey')
    },
    watchERC20TokenBalance(...args) {
        console.log('Mocking: Watching erc20token balance (not implemented)', ...args)
    },
    async approveERC20Token(...args) {
        console.log('Mocking: Approving erc20token...', ...args)
        await sleep(2000)
        return { erc20_approve_transaction_hash: 'a hash', erc20_approve_value: BigInt(233) }
    },
}
