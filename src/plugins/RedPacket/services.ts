import { v4 as uuid } from 'uuid'
import * as jwt from 'jsonwebtoken'
import { omit } from 'lodash-es'
import type { RedPacketRecord, RedPacketRecordInDatabase, RedPacketJSONPayload, History } from './types'
import { RED_PACKET_HISTORY_URL } from './constants'
import { PluginMessageCenter } from '../PluginMessages'
import { RedPacketDatabase } from './database'
import { resolveChainName } from '../../web3/pipes'
import { getChainId } from '../../extension/background-script/EthereumService'
import { web3 } from '../../extension/background-script/EthereumServices/web3'

export async function claimByServer(
    from: string,
    rpid: string,
    password: string,
): Promise<{ claim_transaction_hash: string }> {
    const host = 'https://redpacket.gives'
    const x = 'a3323cd1-fa42-44cd-b053-e474365ab3da'

    const network = resolveChainName(await getChainId()).toLowerCase()
    const auth = await fetch(`${host}/hi?id=${from}&network=${network}`)
    if (!auth.ok) throw new Error('Auth failed')
    const verify = await auth.text()

    const jwt_encoded: {
        password: string
        recipient: string
        redpacket_id: string
        validation: string
        signature: string
    } = {
        password,
        recipient: from,
        redpacket_id: rpid,
        validation: web3.utils.sha3(from)!,
        // TODO: This is not working on MetaMask cause it require the private key.
        signature: await web3.eth.sign(verify, from),
    }
    const pay = await fetch(
        `${host}/please?payload=${jwt.sign(jwt_encoded, x, { algorithm: 'HS256' })}&network=${network}`,
    )
    if (!pay.ok) throw new Error('Pay failed')
    return { claim_transaction_hash: await pay.text() }
}

export async function getRedPacketByID(rpid: string) {
    for await (const i of RedPacketDatabase.iterate('red-packet')) {
        if (i.rpid === rpid) return RedPacketRecordOutDB(i)
    }
    return null
}

export async function addRedPacket(from: string, payload: RedPacketJSONPayload) {
    if (!payload.rpid) return
    const original = await getRedPacketByID(payload.rpid)
    if (original) original
    const record: RedPacketRecord = {
        id: uuid(),
        rpid: payload.rpid,
        from,
        payload,
    }
    await RedPacketDatabase.add(RedPacketRecordIntoDB(record))
    PluginMessageCenter.emit('maskbook.red_packets.update', undefined)
    return record
}

export async function removeRedPacket(rpid: string) {
    // const t = await createRedPacketTransaction('readwrite')
    // TODO
    PluginMessageCenter.emit('maskbook.red_packets.update', undefined)
}

export async function getInboundRedPackets() {
    return []
}

export async function getOutboundRedPackets(from: string) {
    const url = new URL(RED_PACKET_HISTORY_URL)
    url.searchParams.set('from', from)
    const response = await fetch(url.toString())
    if (response.status !== 200) {
        return undefined
    }
    return response.json() as Promise<History.RecordType[]>
}

function RedPacketRecordOutDB(x: RedPacketRecordInDatabase): RedPacketRecord {
    const record = x
    return omit(record, ['type'])
}
function RedPacketRecordIntoDB(x: RedPacketRecord): RedPacketRecordInDatabase {
    const record = x as RedPacketRecordInDatabase
    record.type = 'red-packet'
    return record
}
