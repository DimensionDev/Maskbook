import { omit } from 'lodash-es'
import type { RedPacketNftRecordInDatabase, RedPacketNftRecord } from '../types'
import { RedPacketNftPluginID } from '../constants'
import { createPluginDatabase } from '../../../database/Plugin/wrap-plugin-database'

export const RedPacketNftDatabase = createPluginDatabase<RedPacketNftRecordInDatabase>(RedPacketNftPluginID)

export async function getRedPacketNft(id: string) {
    const record = await RedPacketNftDatabase.get('red-packet-nft', id)
    return record ? RedPacketNftRecordOutDB(record) : undefined
}

export async function addRedPacketNft(record: RedPacketNftRecord) {
    return RedPacketNftDatabase.add(RedPacketNftRecordIntoDB(record))
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
