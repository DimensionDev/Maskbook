import {
    RedPacketRecord,
    RedPacketStatus,
    RedPacketTokenType,
    isNextRedPacketStatusValid,
    RedPacketJSONPayload,
    EthereumNetwork,
} from '../../database/Plugins/Wallet/types'
import { createTransaction, IDBPSafeTransaction } from '../../database/helpers/openDB'
import { createWalletDBAccess, WalletDB } from '../../database/Plugins/Wallet/Wallet.db'
import uuid from 'uuid/v4'
import { mockRedPacketAPI } from './mock'
import { RedPacketCreationResult, RedPacketClaimResult } from './types'
import { getWalletProvider } from './wallet'

function getProvider() {
    return mockRedPacketAPI
}
// TODO
const contract_address = 'unknown'
const everything = ['ERC20Token', 'RedPacket', 'Wallet', 'WalletToken'] as const
export type createRedPacketInit = Pick<
    RedPacketRecord,
    | 'is_random'
    | 'duration'
    | 'sender_address'
    | 'sender_name'
    | 'send_total'
    | 'send_message'
    | 'network'
    | 'token_type'
    | 'erc20_token'
>

export type createRedPacketOption = {
    /** how many recipients of this red packet will be */
    shares: bigint
}

export async function discoverRedPacket(payload: RedPacketJSONPayload) {
    const t = createTransaction(await createWalletDBAccess(), 'readwrite')('RedPacket')
    const rec: RedPacketRecord = {
        _data_source_: getProvider().dataSource,
        aes_version: 1,
        contract_address: payload.contract_address,
        contract_version: payload.contract_version,
        duration: payload.duration,
        id: uuid(),
        is_random: payload.is_random,
        network: payload.network || EthereumNetwork.Mainnet,
        send_message: payload.sender.message,
        send_total: BigInt(payload.total),
        sender_address: payload.sender.address,
        sender_name: payload.sender.name,
        status: RedPacketStatus.incoming,
        uuids: payload.passwords,
        token_type: payload.token_type,
        block_creation_time: new Date(payload.creation_time),
        erc20_token: payload.token,
        red_packet_id: payload.rpid,
        raw_payload: payload,
    }
    t.objectStore('RedPacket').add(rec)
}

export async function getRedPackets(owned: boolean) {
    const t = createTransaction(await createWalletDBAccess(), 'readonly')('RedPacket')
    const all = await t.objectStore('RedPacket').getAll()
    if (owned) return all.filter(x => x.create_transaction_hash)
    return all
}

export async function createRedPacket(
    packet: createRedPacketInit,
    otherOptions: createRedPacketOption,
): Promise<{ passwords: string[] }> {
    if (packet.send_total < otherOptions.shares) {
        throw new Error('At least [number of red packets] tokens to your red packet.')
    } else if (otherOptions.shares < 0) {
        throw new Error('At least 1 person should be able to claim the red packet.')
    }
    const passwords: string[] = Array(Number(otherOptions.shares))
        .fill('')
        .map(uuid)
    let erc20_approve_transaction_hash: string | undefined = undefined
    let erc20_approve_value: bigint | undefined = undefined
    let erc20_token: string | undefined = undefined
    if (packet.token_type === RedPacketTokenType.erc20) {
        if (!packet.erc20_token?.address) throw new Error('ERC20 token should have erc20_token field')
        const res = await getWalletProvider().approveERC20Token({
            redPacketAddress: contract_address,
            amount: packet.send_total,
            erc20TokenAddress: packet.erc20_token.address,
        })
        TODO: erc20_token = ''
        erc20_approve_transaction_hash = res.erc20_approve_transaction_hash
        erc20_approve_value = res.erc20_approve_value
    } else if (packet.token_type === RedPacketTokenType.erc721) {
        throw new Error('Not supported')
    }
    const { create_transaction_hash, create_nonce } = await getProvider().create(
        passwords,
        packet.is_random,
        packet.duration,
        Array.from(crypto.getRandomValues(new Uint32Array(8))),
        packet.send_message,
        packet.sender_name,
    )
    const record: RedPacketRecord = {
        _data_source_: getProvider().dataSource,
        aes_version: 1,
        contract_version: 1,
        contract_address,
        id: uuid(),
        duration: packet.duration,
        is_random: packet.is_random,
        network: packet.network,
        send_message: packet.send_message,
        send_total: packet.send_total,
        sender_address: packet.sender_address,
        sender_name: packet.sender_name,
        status: RedPacketStatus.pending,
        token_type: packet.token_type,
        uuids: passwords,
        block_creation_time: new Date(),
        create_nonce,
        create_transaction_hash,
        erc20_approve_transaction_hash,
        erc20_approve_value,
        erc20_token: undefined,
    }
    {
        const transaction = createTransaction(await createWalletDBAccess(), 'readwrite')(...everything)
        transaction.objectStore('RedPacket').add(record)
    }
    getProvider().watchCreateResult(create_transaction_hash)
    return { passwords }
}

export async function onCreationResult(recordUUID: string, details: RedPacketCreationResult) {
    const t = createTransaction(await createWalletDBAccess(), 'readwrite')('RedPacket')
    const rec = await t.objectStore('RedPacket').get(recordUUID)
    if (!rec) return

    setNextState(rec, details.type === 'success' ? RedPacketStatus.normal : RedPacketStatus.fail)

    if (details.type === 'failed') {
    } else {
        rec.block_creation_time = details.block_creation_time
        rec.red_packet_id = details.red_packet_id
    }
    t.objectStore('RedPacket').put(rec)
}

export async function claimRedPacket(redPacketID: string, passwords: string[]) {
    // TODO: what args should i use?
    const claimReturn = await getProvider().claim(redPacketID, passwords[0], '_recipient???', '_validation???')
    {
        const t = createTransaction(await createWalletDBAccess(), 'readwrite')('RedPacket')
        const rec = await getRedPacketByID(t, redPacketID)
        setNextState(rec, RedPacketStatus.claim_pending)
        t.objectStore('RedPacket').put(rec)
    }
    getProvider().watchClaimResult(redPacketID)
}

export async function onClaimResult(redPacketID: string, details: RedPacketClaimResult) {
    {
        const t = createTransaction(await createWalletDBAccess(), 'readwrite')('RedPacket')
        const rec = await getRedPacketByID(t, redPacketID)
        setNextState(rec, details.type === 'success' ? RedPacketStatus.claimed : RedPacketStatus.normal)
        t.objectStore('RedPacket').put(rec)
    }
    getProvider().watchExpired(redPacketID)
}

export async function onExpired(redPacketID: string) {
    {
        const t = createTransaction(await createWalletDBAccess(), 'readwrite')('RedPacket')
        const rec = await getRedPacketByID(t, redPacketID)
        setNextState(rec, RedPacketStatus.expired)
        t.objectStore('RedPacket').put(rec)
    }
}
// TODO: this should be called automatically when the red_packet is outdated
export async function requestRefund(id: string) {
    const { refund_transaction_hash } = await getProvider().refund(id)
    {
        const t = createTransaction(await createWalletDBAccess(), 'readwrite')('RedPacket')
        const rec = await getRedPacketByID(t, id)
        setNextState(rec, RedPacketStatus.refund_pending)
        rec.refund_transaction_hash = refund_transaction_hash
    }
}
export async function onRefundResult(id: string, details: { remaining_balance: bigint }) {
    {
        const t = createTransaction(await createWalletDBAccess(), 'readwrite')('RedPacket')
        const rec = await getRedPacketByID(t, id)
        setNextState(rec, RedPacketStatus.refunded)
        t.objectStore('RedPacket').put(rec)
    }
}

export async function redPacketSyncInit() {
    const t = createTransaction(await createWalletDBAccess(), 'readonly')('RedPacket')
    const recs = await t.objectStore('RedPacket').getAll()
    recs.forEach(x => {
        x.red_packet_id && getProvider().watchClaimResult(x.red_packet_id)
        x.red_packet_id && getProvider().watchExpired(x.red_packet_id)
        x.create_transaction_hash && getProvider().watchCreateResult(x.create_transaction_hash)
    })
}

// TODO: remove the cond
if (process.env.NODE_ENV === 'development') {
    setTimeout(() => {
        redPacketSyncInit()
    }, 1000)
}

async function getRedPacketByID(t: IDBPSafeTransaction<WalletDB, ['RedPacket'], 'readonly'>, id: string) {
    const rec = await t
        .objectStore('RedPacket')
        .index('red_packet_id')
        .get(id)
    assert(rec)
    return rec
}
function setNextState(rec: RedPacketRecord, nextState: RedPacketStatus) {
    assert(isNextRedPacketStatusValid(rec.status, nextState), 'Invalid state')
    rec.status = nextState
}

export function assert(x: any, ...args: any): asserts x {
    console.assert(x, ...args)
}
