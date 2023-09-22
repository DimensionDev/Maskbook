import { omit } from 'lodash-es'
import type {
    RedPacketRecord,
    RedPacketRecordInDatabase,
    RedPacketNftRecordInDatabase,
} from '@masknet/web3-providers/types'
import type { Plugin } from '@masknet/plugin-infra'

export let RedPacketDatabase: Plugin.Worker.DatabaseStorage<RedPacketRecordInDatabase | RedPacketNftRecordInDatabase>

export function setupDatabase(x: typeof RedPacketDatabase) {
    RedPacketDatabase = x
}

export async function getAllRedpackets(ids: string[]) {
    const records: RedPacketRecord[] = []
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
