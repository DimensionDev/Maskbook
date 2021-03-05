import type { RedPacketRecord, RedPacketRecordInDatabase } from './types'
import { RedPacketPluginID } from './constants'
import { createPluginDatabase } from '../../database/Plugin/wrap-plugin-database'
import { omit } from 'lodash-es'

export const RedPacketDatabase = createPluginDatabase<RedPacketRecordInDatabase>(RedPacketPluginID)

export async function getRedPacketsHistory(txids: string[]) {
    const records: RedPacketRecord[] = []
    for (const txid of txids) {
        const record = await getRedPacket(txid)
        if (record) records.push(record)
    }
    return records
}

export async function getRedPacket(txid: string) {
    const record = await RedPacketDatabase.get('red-packet', txid)
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
