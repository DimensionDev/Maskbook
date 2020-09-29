import { v4 as uuid } from 'uuid'
import type { RedPacketRecord, RedPacketRecordInDatabase, RedPacketJSONPayload } from './types'
import { RED_PACKET_HISTORY_URL } from './constants'
import { PluginMessageCenter } from '../PluginMessages'
import { RedPacketDatabase } from './database'
import { omit } from 'lodash-es'

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
    // return response.json() as Promise<History.RecordType[]>
    return response.json() as any
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
