import { AbiItem } from 'web3-utils'
import { RedPacketAPI, WalletAPI, RedPacketClaimResult, RedPacketCreationResult } from './types'
import { sleep } from '@holoflows/kit/es/util/sleep'
import { onClaimResult, onCreationResult, onExpired, onRefundResult } from './red-packet-fsm'
import { onWalletBalanceUpdated } from './wallet'
import { web3 } from './web3'
import HappyRedPacketABI from '../../contracts/HappyRedPacket.json'
import IERC20ABI from '../../contracts/IERC20.json'
import { HappyRedPacket } from '../../contracts/HappyRedPacket'
import { IERC20 } from '../../contracts/IERC20'
import { TransactionObject } from '../../contracts/types'

function createRedPacketContract(address: string) {
    return (new web3.eth.Contract(HappyRedPacketABI as AbiItem[], address) as unknown) as HappyRedPacket
}

function createERC20Contract(address: string) {
    return (new web3.eth.Contract(IERC20ABI as AbiItem[], address) as unknown) as IERC20
}

async function createTxPayload<T>(tx: TransactionObject<T>, value?: string) {
    const from = await web3.eth.getCoinbase()
    const [gas, gasPrice] = await Promise.all([
        tx.estimateGas({
            value,
            from,
        }),
        web3.eth.getGasPrice(),
    ])

    return {
        from,
        gas,
        gasPrice,
        value,
    }
}

export const mockRedPacketAPI: RedPacketAPI = {
    dataSource: 'mock',
    async create(
        hashes: string[],
        isRandom: boolean,
        duration: number,
        seed: string,
        message: string,
        name: string,
        token_type: 0 | 1,
        token_addr: string,
        total_tokens: string,
    ) {
        const contract = createRedPacketContract('0x0')
        const tx = contract.methods.create_red_packet(
            hashes,
            isRandom,
            duration,
            seed,
            message,
            name,
            token_type,
            token_addr,
            total_tokens,
        )

        return new Promise<{
            create_transaction_hash: string
            create_nonce: number
        }>(async (resolve, reject) => {
            tx.send(await createTxPayload(tx, total_tokens))
                .on('transactionHash', async (hash: string) =>
                    resolve({
                        create_nonce: (await web3.eth.getTransaction(hash)).nonce,
                        create_transaction_hash: hash,
                    }),
                )
                .on('error', (err: Error) => reject(err))
        })
    },
    async claim(id: string, password: string, recipient: string, validation: string) {
        const contract = createRedPacketContract('0x0')
        const tx = contract.methods.claim(id, password, recipient, validation)
        return BigInt(await tx.send(await createTxPayload(tx)))
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
        const contract = createRedPacketContract('0x0')
        const tx = contract.methods.check_availability(id)
        const { balance, claimed, expired, token_address, total } = await tx.call(await createTxPayload(tx))
        return {
            balance: BigInt(balance),
            claimedCount: parseInt(claimed),
            expired,
            token_address,
            totalCount: parseInt(total),
        }
    },
    async refund(id: string) {
        const contract = createRedPacketContract('0x0')
        const tx = contract.methods.refund(id)

        return new Promise<{ refund_transaction_hash: string }>(async (resolve, reject) => {
            tx.send(await createTxPayload(tx))
                .on('transactionHash', (hash: string) =>
                    resolve({
                        refund_transaction_hash: hash,
                    }),
                )
                .on('error', (error: Error) => reject(error))
        })
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
    async approveERC20Token(address: string, amount: string) {
        const contract = createRedPacketContract('0x0')
        const erc20Contract = createERC20Contract(address)

        const tx = erc20Contract.methods.approve(contract.options.address, amount)

        return new Promise<{ erc20_approve_transaction_hash: string; erc20_approve_value: bigint }>(
            async (resolve, reject) => {
                tx.send(await createTxPayload(tx))
                    .on('transactionHash', (hash: string) =>
                        resolve({
                            erc20_approve_transaction_hash: hash,
                            erc20_approve_value: BigInt(amount),
                        }),
                    )
                    .on('error', (error: Error) => reject(error))
            },
        )
    },
}
