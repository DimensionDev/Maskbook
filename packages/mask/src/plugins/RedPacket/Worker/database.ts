import { omit } from 'lodash-unified'
import type { RedPacketRecord, RedPacketRecordInDatabase, RedPacketNftRecordInDatabase } from '../types'
import { RedPacketPluginID } from '../constants'
import { createPluginDatabase } from '../../../database/Plugin/wrap-plugin-database'

export const RedPacketDatabase = createPluginDatabase<RedPacketRecordInDatabase | RedPacketNftRecordInDatabase>(
    RedPacketPluginID,
)

export async function getAllRedpackets(ids: string[]) {
    const records = []
    for await (const record of RedPacketDatabase.iterate('red-packet')) {
        if (ids.includes(record.value.id)) records.push(RedPacketRecordOutDB(record.value))
    }
    return records
}

export async function getRedPacket(id: string) {
    const record = await RedPacketDatabase.get('red-packet', id)
    return record ? RedPacketRecordOutDB(record) : undefined
}

export async function addRedPacket(record: RedPacketRecord) {
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
