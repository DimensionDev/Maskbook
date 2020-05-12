import { omit } from 'lodash-es'
import {
    RedPacketRecord,
    RedPacketStatus,
    EthereumTokenType,
    isNextRedPacketStatusValid,
    RedPacketJSONPayload,
    EthereumNetwork,
    RedPacketRecordInDatabase,
} from './database/types'
import { createTransaction, IDBPSafeTransaction } from '../../database/helpers/openDB'
import { createWalletDBAccess, WalletDB } from './database/Wallet.db'
import { v4 as uuid } from 'uuid'
import type { RedPacketCreationResult, RedPacketClaimResult } from './types'
import { getWalletProvider, getWallets, recoverWallet, getDefaultWallet, setDefaultWallet } from './wallet'
import { PluginMessageCenter } from '../PluginMessages'
import Web3Utils from 'web3-utils'
import { redPacketAPI } from './real'
import { sideEffect } from '../../utils/side-effects'
import BigNumber from 'bignumber.js'
import { getNetworkSettings } from './UI/Developer/SelectEthereumNetwork'

function getProvider() {
    return redPacketAPI
}
const everything = ['ERC20Token', 'RedPacket', 'Wallet'] as const
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
    | 'shares'
>

/**
 * Note: Only call this for other one's redpacket or it will duplicate in the database!
 */
export async function discoverRedPacket(payload: RedPacketJSONPayload, foundInURL: string) {
    const t = createTransaction(await createWalletDBAccess(), 'readwrite')('RedPacket')
    const original = await t.objectStore('RedPacket').index('red_packet_id').get(payload.rpid)
    if (original) return RedPacketRecordOutDB(original)
    const record: RedPacketRecord = {
        _data_source_: getProvider().dataSource,
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
    t.objectStore('RedPacket').add(RedPacketRecordIntoDB(record))
    PluginMessageCenter.emit('maskbook.red_packets.update', undefined)
    return record
}

export async function getRedPackets(owned?: boolean) {
    const t = createTransaction(await createWalletDBAccess(), 'readonly')('RedPacket')
    const all = (await t.objectStore('RedPacket').getAll()).map(RedPacketRecordOutDB)
    if (owned === true) return all.filter((x) => x.create_transaction_hash)
    if (owned === false) return all.filter((x) => !x.create_transaction_hash)
    return all
}

export async function createRedPacket(packet: createRedPacketInit): Promise<{ password: string }> {
    if (packet.send_total.isLessThan(packet.shares)) {
        throw new Error('At least [number of red packets] tokens to your red packet.')
    } else if (packet.shares.isNegative() /* packet.shares < 0n */) {
        throw new Error('At least 1 person should be able to claim the red packet.')
    }
    const password = uuid()
    let erc20_approve_transaction_hash: string | undefined = undefined
    let erc20_approve_value: BigNumber | undefined = undefined
    let erc20_token_address: string | undefined = undefined
    if (packet.token_type === EthereumTokenType.erc20) {
        if (!packet.erc20_token) throw new Error('ERC20 token should have erc20_token field')
        const res = await getWalletProvider().approveERC20Token(
            packet.sender_address,
            packet.erc20_token,
            packet.send_total,
        )
        erc20_token_address = packet.erc20_token
        erc20_approve_transaction_hash = res.erc20_approve_transaction_hash
        erc20_approve_value = res.erc20_approve_value
    } else if (packet.token_type === EthereumTokenType.erc721) {
        throw new Error('Not supported')
    }
    const { create_transaction_hash, create_nonce } = await getProvider().create(
        packet.sender_address,
        Web3Utils.sha3(password),
        packet.shares.toNumber(),
        packet.is_random,
        packet.duration,
        Web3Utils.sha3(Math.random().toString()),
        packet.send_message,
        packet.sender_name,
        packet.token_type,
        erc20_token_address || /** this param must be a valid address */ packet.sender_address,
        packet.send_total,
    )
    const record: RedPacketRecord = {
        _data_source_: getProvider().dataSource,
        aes_version: 1,
        contract_version: 1,
        contract_address: getNetworkSettings().happyRedPacketContractAddress,
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
    {
        const transaction = createTransaction(await createWalletDBAccess(), 'readwrite')(...everything)
        transaction.objectStore('RedPacket').add(RedPacketRecordIntoDB(record))
    }
    getProvider().watchCreateResult({ databaseID: record.id, transactionHash: create_transaction_hash })
    PluginMessageCenter.emit('maskbook.red_packets.update', undefined)
    return record
}

export async function onCreationResult(id: { databaseID: string }, details: RedPacketCreationResult) {
    const t = createTransaction(await createWalletDBAccess(), 'readwrite')('RedPacket', 'ERC20Token')
    const record = await t.objectStore('RedPacket').get(id.databaseID)
    if (!record) return

    setNextState(
        RedPacketRecordOutDB(record),
        details.type === 'success' ? RedPacketStatus.normal : RedPacketStatus.fail,
    )

    if (details.type === 'failed') {
    } else {
        let token: RedPacketJSONPayload['token'] | undefined = undefined
        if (record.erc20_token) {
            const tokenRec = await t.objectStore('ERC20Token').get(record.erc20_token)
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
    t.objectStore('RedPacket').put(record)
    // TODO: send a notification here.
    PluginMessageCenter.emit('maskbook.red_packets.update', undefined)
}

export async function claimRedPacket(
    id: { redPacketID: string },
    _claimWithWallet?: string,
    setAsDefault?: boolean,
): Promise<'claiming' | 'expired' | 'empty'> {
    const rec = await getRedPacketByID(undefined, id.redPacketID)
    if (!rec) throw new Error('You should call discover first')

    const claimWithWallet = _claimWithWallet ?? (await getDefaultWallet()).address
    if (setAsDefault) setDefaultWallet(claimWithWallet)

    const passwords = rec.password
    const status = await getProvider().checkAvailability(id)
    if (status.expired) {
        await onExpired(id)
        return 'expired'
    } else if (status.claimedCount === status.totalCount || status.balance.isZero() /* status.balance === 0n */) {
        {
            const t = createTransaction(await createWalletDBAccess(), 'readwrite')('RedPacket')
            const record = await getRedPacketByID(t, id.redPacketID)
            setNextState(record, RedPacketStatus.empty)
            t.objectStore('RedPacket').put(RedPacketRecordIntoDB(record))
        }
        PluginMessageCenter.emit('maskbook.red_packets.update', undefined)
        return 'empty'
    }

    const { claim_transaction_hash } = await getProvider()
        .claim(id, passwords, claimWithWallet, Web3Utils.sha3(claimWithWallet))
        .catch(async (e) => {
            console.log(e.message)
            if ((e.message as string).includes('insufficient funds for gas')) {
                const wallet = (await getWallets())[0].find((x) => x.address === claimWithWallet)!
                const { privateKey } = await recoverWallet(wallet.mnemonic, wallet.passphrase)
                return getProvider().claimByServer(claimWithWallet, privateKey, rec.raw_payload!)
            }
            throw e
        })
    let dbID = ''
    {
        const t = createTransaction(await createWalletDBAccess(), 'readwrite')('RedPacket')
        const record = await getRedPacketByID(t, id.redPacketID)
        dbID = record.id
        setNextState(record, RedPacketStatus.claim_pending)
        record.claim_transaction_hash = claim_transaction_hash
        t.objectStore('RedPacket').put(RedPacketRecordIntoDB(record))
    }
    getProvider().watchClaimResult({ transactionHash: claim_transaction_hash, databaseID: dbID })
    PluginMessageCenter.emit('maskbook.red_packets.update', undefined)
    return 'claiming'
}

export async function onClaimResult(id: { databaseID: string }, details: RedPacketClaimResult) {
    {
        const t = createTransaction(await createWalletDBAccess(), 'readwrite')('RedPacket')
        const record = await t.objectStore('RedPacket').get(id.databaseID)
        if (!record) throw new Error('Claim result of unknown id')
        setNextState(
            RedPacketRecordOutDB(record),
            details.type === 'success' ? RedPacketStatus.claimed : RedPacketStatus.normal,
        )
        if (details.type === 'success') {
            record.claim_address = details.claimer
            record.claim_amount = details.claimed_value.toString()
        }
        t.objectStore('RedPacket').put(record)
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
        const record = await getRedPacketByID(t, id.redPacketID)
        if (record.status !== RedPacketStatus.expired) {
            setNextState(record, RedPacketStatus.expired)
            t.objectStore('RedPacket').put(RedPacketRecordIntoDB(record))
        }

        if (record.create_transaction_hash) requestRefund(id)
    }
    PluginMessageCenter.emit('maskbook.red_packets.update', undefined)
}

export async function requestRefund(id: { redPacketID: string }) {
    const { refund_transaction_hash } = await getProvider().refund(id)
    let dbID = ''
    {
        const t = createTransaction(await createWalletDBAccess(), 'readwrite')('RedPacket')
        const record = await getRedPacketByID(t, id.redPacketID)
        dbID = record.id
        setNextState(record, RedPacketStatus.refund_pending)
        record.refund_transaction_hash = refund_transaction_hash
        t.objectStore('RedPacket').put(RedPacketRecordIntoDB(record))
    }
    getProvider().watchRefundResult({ databaseID: dbID, transactionHash: refund_transaction_hash })
    // TODO: send a notification here maybe?
    PluginMessageCenter.emit('maskbook.red_packets.update', undefined)
}
export async function onRefundResult(id: { redPacketID: string }, details: { remaining_balance: BigNumber }) {
    {
        const t = createTransaction(await createWalletDBAccess(), 'readwrite')('RedPacket')
        const record = await getRedPacketByID(t, id.redPacketID)
        setNextState(record, RedPacketStatus.refunded)
        record.refund_amount = details.remaining_balance
        t.objectStore('RedPacket').put(RedPacketRecordIntoDB(record))
    }
    // TODO: send a notification here.
    PluginMessageCenter.emit('maskbook.red_packets.update', undefined)
}

export async function redPacketSyncInit() {
    const t = createTransaction(await createWalletDBAccess(), 'readonly')('RedPacket')
    const recs = await t.objectStore('RedPacket').getAll()
    recs.forEach((x) => {
        if (x.claim_transaction_hash && x.status === RedPacketStatus.claim_pending) {
            getProvider().watchClaimResult({ databaseID: x.id, transactionHash: x.claim_transaction_hash })
        }
        if (x.red_packet_id && x.status !== RedPacketStatus.refunded && x.status !== RedPacketStatus.empty) {
            getProvider().watchExpired({ redPacketID: x.red_packet_id })
        }
        if (x.create_transaction_hash && x.status === RedPacketStatus.pending) {
            getProvider().watchCreateResult({ databaseID: x.id, transactionHash: x.create_transaction_hash })
        }
    })
}

sideEffect.then(() => {
    redPacketSyncInit()
})

export async function getRedPacketByID(
    t: undefined | IDBPSafeTransaction<WalletDB, ['RedPacket'], 'readonly'>,
    id: string,
) {
    if (!t) t = createTransaction(await createWalletDBAccess(), 'readonly')('RedPacket')
    const record = await t.objectStore('RedPacket').index('red_packet_id').get(id)
    assert(record)
    return RedPacketRecordOutDB(record)
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

export function assert(x: any, ...args: any): asserts x {
    console.assert(x, ...args)
    if (!x) throw new Error('Assert failed!')
}

function RedPacketRecordOutDB(x: RedPacketRecordInDatabase): RedPacketRecord {
    const names = ['send_total', 'claim_amount', 'refund_amount', 'erc20_approve_value', 'shares'] as const
    const record = omit(x, names) as RedPacketRecord
    for (const name of names) {
        const original = x[name]
        if (typeof original !== 'undefined') {
            record[name] = new BigNumber(String(original))
        }
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
    return record
}
