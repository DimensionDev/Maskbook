import { RedPacketAPI, WalletAPI, RedPacketClaimResult, RedPacketCreationResult } from './types'
import { sleep } from '@holoflows/kit/es/util/sleep'
import { onClaimResult, onCreationResult, onExpired } from './red-packet-fsm'
import { onWalletBalanceUpdated } from './wallet'

export const mockRedPacketAPI: RedPacketAPI = {
    dataSource: 'mock',
    async create(...args) {
        console.log('create_red_packet', ...args)
        await sleep(1000)
        return { create_transaction_hash: 'create_transaction_hash', create_nonce: 123 }
    },
    async claim(...args) {
        console.log('claim', ...args)
        await sleep(1000)
        return BigInt(Math.floor(Math.random() * 10000))
    },

    async watchClaimResult(id: string) {
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
        console.log('Watching creation...', transactionHash)
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
        await sleep(10000)
        onExpired(id)
    },
    async checkAvailability(id: string) {
        return { balance: BigInt(233), claimedCount: 5, expired: false, token_address: 'token address', totalCount: 10 }
    },
    async refund(id: string) {
        return { refund_transaction_hash: 'transaction hash' }
    },
    watchRefundResult() {
        console.log('Watching refund result...')
    },
}

export const mockWalletAPI: WalletAPI = {
    dataSource: 'mock',
    watchWalletBalance(address) {
        setInterval(() => {
            onWalletBalanceUpdated(address, BigInt(Math.floor(Math.random() * 1000)))
        }, 4000)
    },
}
