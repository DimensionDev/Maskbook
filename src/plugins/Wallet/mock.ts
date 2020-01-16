import { RedPacketAPI, WalletAPI } from './types'
import { sleep } from '@holoflows/kit/es/util/sleep'
import { onClaimResult, onCreationResult, onExpired } from './red-packet-fsm'
import { onWalletBalanceUpdated } from './wallet'

export const mockRedPacketAPI: RedPacketAPI = {
    dataSource: 'mock',
    async create_red_packet(...args) {
        console.log('create_red_packet', ...args)
        await sleep(1000)
        return { create_transaction_hash: 'create_transaction_hash', create_nonce: 123 }
    },
    async claim(...args) {
        console.log('claim', ...args)
        await sleep(1000)
        return 'a unknown string'
    },

    async watchClaimResult(id: string) {
        await sleep(10000)
        onClaimResult(id, { type: Math.random() > 0.5 ? 'failed' : 'success' })
    },
    async watchCreateResult(id: string) {
        await sleep(10000)
        onCreationResult(
            id,
            Math.random() > 0.5
                ? { type: 'success', block_creation_time: new Date(), red_packet_id: 'ipgdipgdicp' }
                : { type: 'failed', reason: 'uh.chuchuc' },
        )
    },
    async watchExpired(id: string) {
        await sleep(10000)
        onExpired(id)
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
