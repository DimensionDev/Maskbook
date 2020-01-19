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
import { PluginMessageCenter } from '../PluginMessages'
import { requestNotification } from '../../utils/notification'
import Web3Utils from 'web3-utils'

function getProvider() {
    return mockRedPacketAPI
}
const contract_address = '0x19D0b6091D37Bc262ecC460ee4Bd57DBBD68754C'
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

/**
 * Note: Only call this for other one's redpacket or it will duplicate in the database!
 */
export async function discoverRedPacket(payload: RedPacketJSONPayload, foundInURL: string) {
    const t = createTransaction(await createWalletDBAccess(), 'readwrite')('RedPacket')
    const original = await t
        .objectStore('RedPacket')
        .index('red_packet_id')
        .get(payload.rpid)
    if (original) return original
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
        _found_in_url_: foundInURL,
    }
    t.objectStore('RedPacket').add(rec)
    PluginMessageCenter.emit('maskbook.red_packets.update', undefined)
    return rec
}

export async function getRedPackets(owned?: boolean) {
    const t = createTransaction(await createWalletDBAccess(), 'readonly')('RedPacket')
    const all = await t.objectStore('RedPacket').getAll()
    if (owned === true) return all.filter(x => x.create_transaction_hash)
    if (owned === false) return all.filter(x => !x.create_transaction_hash)
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
        const res = await getWalletProvider().approveERC20Token(packet.erc20_token.address, packet.send_total)
        TODO: erc20_token = ''
        erc20_approve_transaction_hash = res.erc20_approve_transaction_hash
        erc20_approve_value = res.erc20_approve_value
    } else if (packet.token_type === RedPacketTokenType.erc721) {
        throw new Error('Not supported')
    }
    const { create_transaction_hash, create_nonce } = await getProvider().create(
        passwords.map(Web3Utils.sha3),
        packet.is_random,
        packet.duration,
        Array.from(crypto.getRandomValues(new Uint32Array(8))),
        packet.send_message,
        packet.sender_name,
        packet.token_type,
        packet.erc20_token?.address || '',
        packet.send_total,
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
    getProvider().watchCreateResult({ databaseID: record.id, transactionHash: create_transaction_hash })
    PluginMessageCenter.emit('maskbook.red_packets.update', undefined)
    return { passwords }
}

export async function onCreationResult(id: { databaseID: string }, details: RedPacketCreationResult) {
    const t = createTransaction(await createWalletDBAccess(), 'readwrite')('RedPacket')
    const rec = await t.objectStore('RedPacket').get(id.databaseID)
    if (!rec) return

    setNextState(rec, details.type === 'success' ? RedPacketStatus.normal : RedPacketStatus.fail)

    if (details.type === 'failed') {
    } else {
        rec.block_creation_time = details.block_creation_time
        rec.red_packet_id = details.red_packet_id
        rec.raw_payload = {
            contract_address: rec.contract_address,
            contract_version: rec.contract_version,
            creation_time: details.block_creation_time.getTime(),
            duration: rec.duration,
            is_random: rec.is_random,
            passwords: rec.uuids,
            rpid: details.red_packet_id,
            sender: {
                address: rec.sender_address,
                message: rec.send_message,
                name: rec.sender_name,
            },
            token_type: rec.token_type,
            total: String(rec.send_total),
            network: rec.network,
            token: rec.erc20_token,
        }
    }
    t.objectStore('RedPacket').put(rec)
    // TODO: send a notification here.
    PluginMessageCenter.emit('maskbook.red_packets.update', undefined)
}

export async function claimRedPacket(id: { redPacketID: string }, claimWithWallet: string) {
    const rec = await getRedPacketByID(undefined, id.redPacketID)
    if (!rec) throw new Error('You should call discover first')

    const passwords = rec.uuids
    const status = await getProvider().checkAvailability(id)
    const { claim_transaction_hash } = await getProvider().claim(
        id,
        passwords[status.claimedCount],
        claimWithWallet,
        Web3Utils.sha3(claimWithWallet),
    )
    let dbID = ''
    {
        const t = createTransaction(await createWalletDBAccess(), 'readwrite')('RedPacket')
        const rec = await getRedPacketByID(t, id.redPacketID)
        dbID = rec.id
        setNextState(rec, RedPacketStatus.claim_pending)
        rec.claim_transaction_hash = claim_transaction_hash
        t.objectStore('RedPacket').put(rec)
    }
    getProvider().watchClaimResult({ transactionHash: claim_transaction_hash, databaseID: dbID })
    requestNotification({ body: 'We will notify you when claiming process is ready.' })
    PluginMessageCenter.emit('maskbook.red_packets.update', undefined)
}

export async function onClaimResult(id: { databaseID: string }, details: RedPacketClaimResult) {
    {
        const t = createTransaction(await createWalletDBAccess(), 'readwrite')('RedPacket')
        const rec = await t.objectStore('RedPacket').get(id.databaseID)
        if (!rec) throw new Error('Claim result of unknown id')
        setNextState(rec, details.type === 'success' ? RedPacketStatus.claimed : RedPacketStatus.normal)
        if (details.type === 'success') {
            rec.claim_address = details.claimer
            rec.claim_amount = details.claimed_value
        }
        t.objectStore('RedPacket').put(rec)
    }
    if (details.type === 'success') {
        getProvider().watchExpired({ redPacketID: details.red_packet_id })
    }
    // TODO: send a notification here
    PluginMessageCenter.emit('maskbook.red_packets.update', undefined)
}

export async function onExpired(id: { redPacketID: string }) {
    {
        const t = createTransaction(await createWalletDBAccess(), 'readwrite')('RedPacket')
        const rec = await getRedPacketByID(t, id.redPacketID)
        setNextState(rec, RedPacketStatus.expired)
        t.objectStore('RedPacket').put(rec)

        if (rec.create_transaction_hash) requestRefund(id)
    }
    PluginMessageCenter.emit('maskbook.red_packets.update', undefined)
}

export async function requestRefund(id: { redPacketID: string }) {
    const { refund_transaction_hash } = await getProvider().refund(id)
    let dbID = ''
    {
        const t = createTransaction(await createWalletDBAccess(), 'readwrite')('RedPacket')
        const rec = await getRedPacketByID(t, id.redPacketID)
        dbID = rec.id
        setNextState(rec, RedPacketStatus.refund_pending)
        rec.refund_transaction_hash = refund_transaction_hash
    }
    getProvider().watchRefundResult({ databaseID: dbID, transactionHash: refund_transaction_hash })
    // TODO: send a notification here maybe?
    PluginMessageCenter.emit('maskbook.red_packets.update', undefined)
}
export async function onRefundResult(id: { databaseID: string }, details: { remaining_balance: bigint }) {
    {
        const t = createTransaction(await createWalletDBAccess(), 'readwrite')('RedPacket')
        const rec = await getRedPacketByID(t, id.databaseID)
        setNextState(rec, RedPacketStatus.refunded)
        rec.refund_amount = details.remaining_balance
        t.objectStore('RedPacket').put(rec)
    }
    // TODO: send a notification here.
    PluginMessageCenter.emit('maskbook.red_packets.update', undefined)
}

export async function redPacketSyncInit() {
    const t = createTransaction(await createWalletDBAccess(), 'readonly')('RedPacket')
    const recs = await t.objectStore('RedPacket').getAll()
    recs.forEach(x => {
        x.claim_transaction_hash &&
            getProvider().watchClaimResult({ databaseID: x.id, transactionHash: x.claim_transaction_hash })
        x.red_packet_id && getProvider().watchExpired({ redPacketID: x.red_packet_id })
        x.create_transaction_hash &&
            getProvider().watchCreateResult({ databaseID: x.id, transactionHash: x.create_transaction_hash })
    })
}

setTimeout(() => {
    redPacketSyncInit()
}, 1000)

export async function getRedPacketByID(
    t: undefined | IDBPSafeTransaction<WalletDB, ['RedPacket'], 'readonly'>,
    id: string,
) {
    if (!t) t = createTransaction(await createWalletDBAccess(), 'readonly')('RedPacket')
    const rec = await t
        .objectStore('RedPacket')
        .index('red_packet_id')
        .get(id)
    assert(rec)
    return rec
}
function setNextState(rec: RedPacketRecord, nextState: RedPacketStatus) {
    assert(
        isNextRedPacketStatusValid(rec.status, nextState),
        'Invalid state',
        'Current state',
        rec.status,
        'Next state',
        nextState,
    )
    rec.status = nextState
}

export function assert(x: any, ...args: any): asserts x {
    console.assert(x, ...args)
}
