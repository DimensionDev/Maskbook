import type { RedPacketRecord, RedPacketRecordInDatabase } from './types'
import { RedPacketPluginID } from './constants'
import { createPluginDatabase } from '../../database/Plugin/wrap-plugin-database'
import { omit } from 'lodash-es'

export const RedPacketDatabase = createPluginDatabase<RedPacketRecordInDatabase>(RedPacketPluginID)

export async function getRedPacketsHistory(rpids: string[]) {
    const records: RedPacketRecord[] = []
    for (const rpid of rpids) {
        const record = await getRedPacket(rpid)
        if (record) records.push(record)
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

function RedPacketRecordIntoDB(x: RedPacketRecord) {
    const record = x as RedPacketRecordInDatabase
    record.type = 'red-packet'
    return record
}

function RedPacketRecordOutDB(x: RedPacketRecordInDatabase): RedPacketRecord {
    const record = x
    return omit(record, ['type'])
}
