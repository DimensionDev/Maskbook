import { omit } from 'lodash-unified'
import type { RedPacketNftRecordInDatabase, RedPacketNftRecord } from '../types'
import { RedPacketDatabase } from './database'

export async function getRedPacketNft(id: string) {
    const record = await RedPacketDatabase.get('red-packet-nft', id)
    return record ? RedPacketNftRecordOutDB(record) : undefined
}

export async function addRedPacketNft(record: RedPacketNftRecord) {
    return RedPacketDatabase.add(RedPacketNftRecordIntoDB(record))
}

export async function updateRedPacketNft(newRecord: RedPacketNftRecordInDatabase) {
    if (!newRecord.id) {
        return
    }
    const record = await RedPacketDatabase.get('red-packet-nft', newRecord.id)
    if (record) {
        await RedPacketDatabase.remove('red-packet-nft', newRecord.id)
    }
    await RedPacketDatabase.add(newRecord)
}

function RedPacketNftRecordOutDB(x: RedPacketNftRecordInDatabase): RedPacketNftRecord {
    const record = x
    return omit(record, ['type'])
}

function RedPacketNftRecordIntoDB(x: RedPacketNftRecord) {
    const record = x as RedPacketNftRecordInDatabase
    record.type = 'red-packet-nft'
    return record
}
