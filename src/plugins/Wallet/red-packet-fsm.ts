import {
    RedPacketRecord,
    RedPacketStatus,
    RedPacketTokenType,
    isNextRedPacketStatusValid,
} from '../../database/Plugins/Wallet/types'
import { createTransaction, IDBPSafeTransaction } from '../../database/helpers/openDB'
import { createWalletDBAccess, RedPacketDB } from '../../database/Plugins/Wallet/Wallet.db'
import uuid from 'uuid/v4'
import { mockRedPacketAPI } from './mock'

const provider = mockRedPacketAPI
// TODO
const contract_address = 'unknown'
const everything = ['ERC20Token', 'RedPacket', 'Wallet', 'WalletToken'] as const
type createRedPacketInit = Pick<
    RedPacketRecord,
    | 'is_random'
    | 'duration'
    | 'sender_address'
    | 'sender_name'
    | 'send_total'
    | 'send_message'
    | 'network'
    | 'token_type'
    // | 'erc20_token'
>

type createRedPacketOption = {
    /** how many recipients of this red packet will be */
    shares: bigint
}

export async function createRedPacket(
    packet: createRedPacketInit,
    otherOptions: createRedPacketOption,
): Promise<{ passwords: string[] }> {
    if (packet.send_total < otherOptions.shares) {
        throw new Error('At least [number of red packets] tokens to your red packet.')
    } else if (otherOptions.shares < 0) {
        throw new Error('At least 1 person can claim the red packet.')
    }
    const passwords: string[] = Array(Number(otherOptions.shares)).map(uuid)
    if (packet.token_type === RedPacketTokenType.erc20) {
        throw new Error('Not implemented')
        // @ts-ignore TODO:
        await some_special_handling()
    }
    const { create_transaction_hash, create_nonce } = await provider.create_red_packet(
        passwords,
        packet.is_random,
        packet.duration,
        Array.from(crypto.getRandomValues(new Uint32Array(8))),
        packet.send_message,
        packet.sender_name,
    )
    const record: RedPacketRecord = {
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
    }
    {
        const transaction = createTransaction(await createWalletDBAccess(), 'readwrite')(...everything)
        transaction.objectStore('RedPacket').add(record)
    }
    provider.watchCreateResult(create_transaction_hash)
    return { passwords }
}

export async function onCreationResult(
    recordUUID: string,
    details:
        | {
              type: 'success'
              block_creation_time: Date
              red_packet_id: string
          }
        | { type: 'failed'; reason?: string },
) {
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
    const claimReturn = await provider.claim(redPacketID, passwords[0], '_recipient???', '_validation???')
    {
        const t = createTransaction(await createWalletDBAccess(), 'readwrite')('RedPacket')
        const rec = await getRedPacketByID(t, redPacketID)
        setNextState(rec, RedPacketStatus.claim_pending)
        t.objectStore('RedPacket').put(rec)
    }
    provider.watchClaimResult(redPacketID)
}

export async function onClaimResult(redPacketID: string, details: { type: 'success' } | { type: 'failed' }) {
    {
        const t = createTransaction(await createWalletDBAccess(), 'readwrite')('RedPacket')
        const rec = await getRedPacketByID(t, redPacketID)
        setNextState(rec, details.type === 'success' ? RedPacketStatus.claimed : RedPacketStatus.normal)
        t.objectStore('RedPacket').put(rec)
    }
    provider.watchExpired(redPacketID)
}

export async function onExpired(redPacketID: string) {
    {
        const t = createTransaction(await createWalletDBAccess(), 'readwrite')('RedPacket')
        const rec = await getRedPacketByID(t, redPacketID)
        setNextState(rec, RedPacketStatus.expired)
        t.objectStore('RedPacket').put(rec)
    }
}

async function getRedPacketByID(t: IDBPSafeTransaction<RedPacketDB, ['RedPacket'], 'readonly'>, id: string) {
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

function assert(x: any, ...args: any): asserts x {
    console.assert(x, ...args)
}
