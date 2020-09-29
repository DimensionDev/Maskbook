import type { RedPacketRecord, RedPacketRecordInDatabase, RedPacketJSONPayload } from './types'
import { RED_PACKET_HISTORY_URL } from './constants'
import { createRedPacketTransaction } from './database'
import { PluginMessageCenter } from '../PluginMessages'

export async function addRedPacket(from: string, payload: RedPacketJSONPayload) {
    if (!payload.rpid) return
    const t = await createRedPacketTransaction('readwrite')
    const original = await t.getByIndex('rpid', payload.rpid)
    if (original) return RedPacketRecordOutDB(original)
    const record: RedPacketRecord = {
        rpid: payload.rpid,
        from,
        payload,
    }
    await t.add(RedPacketRecordIntoDB(record))
    PluginMessageCenter.emit('maskbook.red_packets.update', undefined)
    return record
}

export async function removeRedPacket(rpid: string) {
    const t = await createRedPacketTransaction('readwrite')
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
    // return response.json() as Promise<History.RecordType[]>
    return response.json() as any
}

function RedPacketRecordOutDB(x: RedPacketRecordInDatabase): RedPacketRecord {
    return x as RedPacketRecord
}
function RedPacketRecordIntoDB(x: RedPacketRecord): RedPacketRecordInDatabase {
    return x as RedPacketRecordInDatabase
}
