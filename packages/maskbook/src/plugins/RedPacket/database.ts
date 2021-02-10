import type { RedPacketRecord, RedPacketRecordInDatabase } from './types'
import { RedPacketPluginID } from './constants'
import { createPluginDatabase } from '../../database/Plugin/wrap-plugin-database'
import { asyncIteratorToArray } from '../../utils/type-transform/asyncIteratorHelpers'
import { omit } from 'lodash-es'

export const RedPacketDatabase = createPluginDatabase<RedPacketRecordInDatabase>(RedPacketPluginID)

export function getRedPackets() {
    return asyncIteratorToArray(RedPacketDatabase.iterate('red-packet'))
}

export async function getRedPacketsHistory(rpids: string[]) {
    const records: RedPacketRecord[] = []
    for await (const record of RedPacketDatabase.iterate('red-packet')) {
        if (rpids.includes(record.payload.rpid)) records.push(RedPacketRecordOutDB(record))
    }
    return records
}

export async function getRedPacket(rpid: string) {
    const record = await RedPacketDatabase.get('red-packet', rpid)
    return record ? RedPacketRecordOutDB(record) : undefined
}

export async function addRedPacket(record: RedPacketRecord) {
    if (await RedPacketDatabase.has('red-packet', record.id)) {
        return
    }
    return RedPacketDatabase.add(RedPacketRecordIntoDB(record))
}

export function removeRedPacket(rpid: string) {
    return RedPacketDatabase.remove('red-packet', rpid)
}

function RedPacketRecordIntoDB(x: RedPacketRecord) {
    const record = x as RedPacketRecordInDatabase
    record.type = 'red-packet'
    return record
}

function RedPacketRecordOutDB(x: RedPacketRecordInDatabase): RedPacketRecord {
    const record = x
    return omit(record, ['type'])
}
