import { RedPacketAPI, WalletAPI, RedPacketClaimResult, RedPacketCreationResult } from './types'
import { sleep } from '@holoflows/kit/es/util/sleep'
import { onClaimResult, onCreationResult, onExpired, onRefundResult } from './red-packet-fsm'
import { onWalletBalanceUpdated } from './wallet'

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
        return BigInt(Math.floor(Math.random() * 10000))
    },

    async watchClaimResult(id: string) {
        console.log('Mock: Watching calming result', id)
        await sleep(10000)
        const r: RedPacketClaimResult =
            Math.random() > 0.5
                ? {
                      type: 'success',
                      claimed_value: Math.random(),
                      claimer: 'claimer address',
                      red_packet_id: 'red packed id',
                  }
                : { type: 'failed' }
        onClaimResult(id, r)
    },
    async watchCreateResult(transactionHash: string) {
        console.log('Mock: Watching creation...', transactionHash)
        await sleep(10000)
        const f: RedPacketCreationResult =
            Math.random() > 0.5
                ? {
                      type: 'success',
                      block_creation_time: new Date(),
                      red_packet_id: 'red packet id',
                      creator: 'creator address',
                      total: 23,
                  }
                : { type: 'failed', reason: 'uh.chuchuc' }
        onCreationResult(transactionHash, f)
    },
    async watchExpired(id: string) {
        console.log('Mock: watching expired', id)
        await sleep(10000)
        onExpired(id)
    },
    async checkAvailability(id: string) {
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
    async refund(id: string) {
        console.log('Mock: calling refund', id)
        return { refund_transaction_hash: 'transaction hash' }
    },
    watchRefundResult(id: string) {
        console.log('Mock: Watching refund result...')
        onRefundResult(id, { remaining_balance: BigInt(10) })
    },
    async checkClaimedList(id) {
        return { claimed_list: ['123', '234'], claimer_addrs: ['0x1234'] }
    },
}

export const mockWalletAPI: WalletAPI = {
    dataSource: 'mock',
    watchWalletBalance(address) {
        setInterval(() => {
            onWalletBalanceUpdated(address, BigInt(Math.floor(Math.random() * 1000)))
        }, 4000)
    },
    async approveERC20Token(opts) {
        console.log('Mocking: Approving erc20token...', opts)
        await sleep(2000)
        return { erc20_approve_transaction_hash: 'a hash', erc20_approve_value: BigInt(233) }
    },
}
