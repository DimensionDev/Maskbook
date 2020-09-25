import { omit } from 'lodash-es'
import { RedPacketRecord, RedPacketStatus, RedPacketRecordInDatabase, RedPacketJSONPayload, History } from './types'
import { v4 as uuid } from 'uuid'
import type { RedPacketCreationResult, RedPacketClaimResult } from './types'
import { getWalletProvider, getDefaultWallet, setDefaultWallet, getToken } from '../Wallet/wallet'
import { PluginMessageCenter } from '../PluginMessages'
import Web3Utils from 'web3-utils'
import { RedPacketAPI, RedPacketID } from './contracts'
import { sideEffect } from '../../utils/side-effects'
import BigNumber from 'bignumber.js'
import { assert, unreachable } from '../../utils/utils'
import { EthereumTokenType, EthereumNetwork } from '../../web3/types'
import { getChainId } from '../../extension/background-script/EthereumService'
import { getConstant } from '../../web3/helpers'
import { RedPacketPluginID, RED_PACKET_CONSTANTS } from './constants'
import { RED_PACKET_HISTORY_URL } from './constants'
import { createPluginDatabase } from '../../database/Plugin/wrap-plugin-database'
import { asyncIteratorToArray } from '../../utils/type-transform/asyncIteratorHelpers'
import type { DatabaseID } from '../Wallet/api'

export const RedPacketDatabase = createPluginDatabase<RedPacketRecordInDatabase>(RedPacketPluginID)
export type CreateRedPacketInit = Pick<
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
    | 'shares'
>

/**
 * Note: Only call this for other one's redpacket or it will duplicate in the database!
 */
export async function discoverRedPacket(payload: RedPacketJSONPayload, foundInURL: string) {
    const original = await getRedPacketByID(payload.rpid)
    if (original) return original
    const record: RedPacketRecord = {
        aes_version: 1,
        contract_address: payload.contract_address,
        contract_version: payload.contract_version,
        duration: payload.duration,
        id: uuid(),
        is_random: payload.is_random,
        network: payload.network || EthereumNetwork.Mainnet,
        send_message: payload.sender.message,
        send_total: new BigNumber(payload.total),
        sender_address: payload.sender.address,
        sender_name: payload.sender.name,
        status: RedPacketStatus.incoming,
        password: payload.password,
        token_type: payload.token_type,
        block_creation_time: new Date(payload.creation_time),
        erc20_token: payload.token?.address,
        red_packet_id: payload.rpid,
        raw_payload: payload,
        _found_in_url_: foundInURL,
        received_time: new Date(),
        shares: new BigNumber(payload.shares),
    }
    await RedPacketDatabase.add(RedPacketRecordIntoDB(record))
    PluginMessageCenter.emit('maskbook.red_packets.update', undefined)
    return record
}

export async function getRedPackets(owned?: boolean) {
    return (await asyncIteratorToArray(f())).map(RedPacketRecordOutDB)
    async function* f() {
        for await (const x of RedPacketDatabase.iterate('red-packet')) {
            if (owned === undefined) yield x
            else if (owned && x.claim_transaction_hash) yield x
            else if (!owned && !x.claim_transaction_hash) yield x
        }
    }
}

// region HACK: THIS TEMPORARY CODE
export async function getRedPacketHistory(from: string) {
    const url = new URL(RED_PACKET_HISTORY_URL)
    url.searchParams.set('from', from)
    const response = await fetch(url.toString())
    if (response.status !== 200) {
        return undefined
    }
    return response.json() as Promise<History.RecordType[]>
}
// endregion

export async function createRedPacket(packet: CreateRedPacketInit): Promise<RedPacketRecord> {
    if (packet.send_total.isLessThan(packet.shares))
        throw new Error('At least [number of red packets] tokens to your red packet.')
    if (packet.shares.isNegative() /* packet.shares < 0n */)
        throw new Error('At least 1 person should be able to claim the red packet.')
    const password = uuid()
    let erc20_approve_transaction_hash: string | undefined = undefined
    let erc20_approve_value: BigNumber | undefined = undefined
    let erc20_token_address: string | undefined = undefined
    if (packet.token_type === EthereumTokenType.ERC721) throw new Error('Not supported')
    if (packet.token_type === EthereumTokenType.ERC20) {
        if (!packet.erc20_token) throw new Error('ERC20 token should have erc20_token field')
        const res = await getWalletProvider().approve(
            packet.sender_address,
            getConstant(RED_PACKET_CONSTANTS, 'HAPPY_RED_PACKET_ADDRESS', await getChainId()),
            packet.erc20_token,
            packet.send_total,
        )
        erc20_token_address = packet.erc20_token
        erc20_approve_transaction_hash = res.erc20_approve_transaction_hash
        erc20_approve_value = res.erc20_approve_value
    }
    const { create_transaction_hash, create_nonce } = await RedPacketAPI.create(
        packet.sender_address,
        Web3Utils.sha3(password)!,
        packet.shares.toNumber(),
        packet.is_random,
        packet.duration,
        Web3Utils.sha3(Math.random().toString())!,
        packet.send_message,
        packet.sender_name,
        packet.token_type,
        erc20_token_address || /** this param must be a valid address */ packet.sender_address,
        packet.send_total,
    )
    const record: RedPacketRecord = {
        aes_version: 1,
        contract_version: 1,
        contract_address: getConstant(RED_PACKET_CONSTANTS, 'HAPPY_RED_PACKET_ADDRESS', await getChainId()),
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
        password: password,
        block_creation_time: new Date(),
        create_nonce,
        create_transaction_hash,
        erc20_approve_transaction_hash,
        erc20_approve_value,
        erc20_token: erc20_token_address,
        received_time: new Date(),
        shares: packet.shares,
    }
    RedPacketDatabase.add(RedPacketRecordIntoDB(record))
    RedPacketAPI.watchCreateResult({ databaseID: record.id, transactionHash: create_transaction_hash })
    PluginMessageCenter.emit('maskbook.red_packets.update', undefined)
    return record
}

export async function onCreationResult(id: DatabaseID, details: RedPacketCreationResult) {
    const record_ = await RedPacketDatabase.get('red-packet', id.databaseID)
    if (!record_) return
    const record = RedPacketRecordOutDB(record_)
    setNextState(record, details.type === 'success' ? RedPacketStatus.normal : RedPacketStatus.fail)

    if (details.type !== 'failed') {
        let token: RedPacketJSONPayload['token'] | undefined = undefined
        if (record.erc20_token) {
            const tokenRec = await getToken(record.erc20_token)
            if (!tokenRec) throw new Error('Unknown token')
            token = {
                address: record.erc20_token,
                decimals: tokenRec.decimals,
                name: tokenRec.name,
                symbol: tokenRec.symbol,
            }
        }
        record.block_creation_time = details.block_creation_time
        record.red_packet_id = details.red_packet_id
        record.raw_payload = {
            contract_address: record.contract_address,
            contract_version: record.contract_version,
            creation_time: details.block_creation_time.getTime(),
            duration: record.duration,
            is_random: record.is_random,
            password: record.password,
            rpid: details.red_packet_id,
            sender: {
                address: record.sender_address,
                message: record.send_message,
                name: record.sender_name,
            },
            token_type: record.token_type,
            total: String(record.send_total),
            network: record.network,
            token,
            shares: new BigNumber(String(record.shares)).toNumber(),
        }
    }
    RedPacketDatabase.add(RedPacketRecordIntoDB(record))
    // TODO: send a notification here.
    PluginMessageCenter.emit('maskbook.red_packets.update', undefined)
}

export async function claimRedPacket(
    id: RedPacketID,
    _claimWithWallet?: string,
    setAsDefault?: boolean,
): Promise<'claiming' | 'expired' | 'empty'> {
    const rec = await getRedPacketByID(id.redPacketID)

    const claimWithWallet = _claimWithWallet ?? (await getDefaultWallet())?.address
    if (!claimWithWallet) throw new Error('You should add wallet first')
    if (setAsDefault) setDefaultWallet(claimWithWallet)

    const passwords = rec.password
    const status = await RedPacketAPI.checkAvailability(id)
    if (status.expired) {
        await onExpired(id)
        return 'expired'
    } else if (status.claimedCount === status.totalCount || status.balance.isZero() /* status.balance === 0n */) {
        const record = await getRedPacketByID(id.redPacketID)
        setNextState(record, RedPacketStatus.empty)
        RedPacketDatabase.add(RedPacketRecordIntoDB(record))
        PluginMessageCenter.emit('maskbook.red_packets.update', undefined)
        return 'empty'
    }

    const { claim_transaction_hash } = await RedPacketAPI.claim(
        id,
        passwords,
        claimWithWallet,
        Web3Utils.sha3(claimWithWallet)!,
    ).catch(async (e) => {
        if ((e.message as string).includes('insufficient funds for gas')) {
            return RedPacketAPI.claimByServer(claimWithWallet, rec.raw_payload!)
        }
        throw e
    })
    let dbID = ''

    const record = await getRedPacketByID(id.redPacketID)
    dbID = record.id
    setNextState(record, RedPacketStatus.claim_pending)
    record.claim_transaction_hash = claim_transaction_hash
    RedPacketDatabase.add(RedPacketRecordIntoDB(record))

    RedPacketAPI.watchClaimResult({ transactionHash: claim_transaction_hash, databaseID: dbID })
    PluginMessageCenter.emit('maskbook.red_packets.update', undefined)
    return 'claiming'
}

export async function onClaimResult(id: { databaseID: string }, details: RedPacketClaimResult) {
    const record_ = await RedPacketDatabase.get('red-packet', id.databaseID)
    if (!record_) throw new Error('Claim result of unknown id')
    const record = RedPacketRecordOutDB(record_)
    setNextState(record, details.type === 'success' ? RedPacketStatus.claimed : RedPacketStatus.normal)
    if (details.type === 'success') {
        record.claim_address = details.claimer
        record.claim_amount = details.claimed_value
    }
    RedPacketDatabase.add(RedPacketRecordIntoDB(record))

    if (details.type === 'success') {
        RedPacketAPI.watchExpired({ redPacketID: details.red_packet_id })
    }
    // TODO: send a notification here
    PluginMessageCenter.emit('maskbook.red_packets.update', undefined)
}

export async function onExpired(id: { redPacketID: string }) {
    const record = await getRedPacketByID(id.redPacketID)
    if (record.status !== RedPacketStatus.expired) {
        setNextState(record, RedPacketStatus.expired)
        RedPacketDatabase.add(RedPacketRecordIntoDB(record))
    }

    if (record.create_transaction_hash) requestRefund(id)

    PluginMessageCenter.emit('maskbook.red_packets.update', undefined)
}

export async function requestRefund(id: { redPacketID: string }) {
    const { refund_transaction_hash } = await RedPacketAPI.refund(id)
    let dbID = ''

    const record = await getRedPacketByID(id.redPacketID)
    dbID = record.id
    setNextState(record, RedPacketStatus.refund_pending)
    record.refund_transaction_hash = refund_transaction_hash
    RedPacketDatabase.add(RedPacketRecordIntoDB(record))

    RedPacketAPI.watchRefundResult({ databaseID: dbID, transactionHash: refund_transaction_hash })
    // TODO: send a notification here maybe?
    PluginMessageCenter.emit('maskbook.red_packets.update', undefined)
}
export async function onRefundResult(id: { redPacketID: string }, details: { remaining_balance: BigNumber }) {
    const record = await getRedPacketByID(id.redPacketID)
    setNextState(record, RedPacketStatus.refunded)
    record.refund_amount = details.remaining_balance
    RedPacketDatabase.add(RedPacketRecordIntoDB(record))
    // TODO: send a notification here.
    PluginMessageCenter.emit('maskbook.red_packets.update', undefined)
}

export async function redPacketSyncInit() {
    for await (const x of RedPacketDatabase.iterate('red-packet')) {
        if (x.claim_transaction_hash && x.status === RedPacketStatus.claim_pending) {
            RedPacketAPI.watchClaimResult({ databaseID: x.id, transactionHash: x.claim_transaction_hash })
        }
        if (x.red_packet_id && x.status !== RedPacketStatus.refunded && x.status !== RedPacketStatus.empty) {
            RedPacketAPI.watchExpired({ redPacketID: x.red_packet_id })
        }
        if (x.create_transaction_hash && x.status === RedPacketStatus.pending) {
            RedPacketAPI.watchCreateResult({ databaseID: x.id, transactionHash: x.create_transaction_hash })
        }
    }
}

sideEffect.then(redPacketSyncInit)

export async function getRedPacketByID(x: string): Promise<RedPacketRecord> {
    for await (const i of RedPacketDatabase.iterate('red-packet')) {
        if (i.red_packet_id === x) return RedPacketRecordOutDB(i)
    }
    throw new Error('Red Packet not found')
}

function setNextState(rec: RedPacketRecord, nextState: RedPacketStatus) {
    assert(
        isNextRedPacketStatusValid(rec.status, nextState),
        'Invalid Red Packet FSM State',
        'Current state:',
        rec.status,
        'Next state:',
        nextState,
    )
    rec.status = nextState
}

function RedPacketRecordOutDB(x: RedPacketRecordInDatabase): RedPacketRecord {
    const names = ['send_total', 'claim_amount', 'refund_amount', 'erc20_approve_value', 'shares'] as const
    const record = omit(x, [...names, 'type']) as RedPacketRecord
    for (const name of names) {
        const original = x[name]
        if (typeof original !== 'undefined') record[name] = new BigNumber(String(original))
    }
    return record
}
function RedPacketRecordIntoDB(x: RedPacketRecord): RedPacketRecordInDatabase {
    const names = ['send_total', 'claim_amount', 'refund_amount', 'erc20_approve_value', 'shares'] as const
    const record = omit(x, names) as RedPacketRecordInDatabase
    for (const name of names) {
        const original = x[name]
        if (typeof original !== 'undefined') {
            record[name] = original.toString()
        }
    }
    record.type = 'red-packet'
    return record
}

export function isNextRedPacketStatusValid(current: RedPacketStatus, next: RedPacketStatus) {
    switch (current) {
        case RedPacketStatus.initial:
            return [RedPacketStatus.pending, RedPacketStatus.fail].includes(next)
        case RedPacketStatus.pending:
            return [RedPacketStatus.fail, RedPacketStatus.normal].includes(next)
        case RedPacketStatus.fail:
        case RedPacketStatus.empty:
        case RedPacketStatus.refunded:
            return false
        case RedPacketStatus.normal:
        case RedPacketStatus.incoming:
            return [RedPacketStatus.claim_pending, RedPacketStatus.expired, RedPacketStatus.empty].includes(next)
        case RedPacketStatus.claim_pending:
            return [RedPacketStatus.normal, RedPacketStatus.incoming, RedPacketStatus.claimed].includes(next)
        case RedPacketStatus.claimed:
            return [RedPacketStatus.refund_pending, RedPacketStatus.expired].includes(next)
        case RedPacketStatus.expired:
            return RedPacketStatus.refund_pending === next
        case RedPacketStatus.refund_pending:
            return RedPacketStatus.refunded === next
        default:
            return unreachable(current)
    }
}
