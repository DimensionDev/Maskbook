import { omit } from 'lodash-es'
import type {
    RedPacketRecord,
    RedPacketRecordInDatabase,
    RedPacketHistory,
    RedPacketNftRecordInDatabase,
} from '../types'
import { RedPacketPluginID } from '../constants'
import { createPluginDatabase } from '../../../database/Plugin/wrap-plugin-database'

export const RedPacketDatabase = createPluginDatabase<RedPacketRecordInDatabase | RedPacketNftRecordInDatabase>(
    RedPacketPluginID,
)

export async function getRedPacket(id: string) {
    const record = await RedPacketDatabase.get('red-packet', id)
    return record ? RedPacketRecordOutDB(record) : undefined
}

export async function addRedPacket(record: RedPacketRecord) {
    return RedPacketDatabase.add(RedPacketRecordIntoDB(record))
}

export async function updateV1ToV2(history: RedPacketHistory) {
    const record_v1 = await getRedPacket(history.rpid)
    if (record_v1?.payload?.contract_version === 1) {
        const record_v1_updated = await getRedPacket(history.txid)
        if (!record_v1_updated) {
            await addRedPacket({
                password: record_v1.payload.password,
                id: history.txid,
                contract_version: 1,
                from: '',
            })
            // TODO: remove the v1 database record after test pass?
            // await RedPacketDatabase.remove('red-packet', history.txid)
        }
    }
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
