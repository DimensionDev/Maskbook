import type { PoolRecord, PoolRecordInDatabase } from '../types'
import { ITO_PluginID } from '../constants'
import { createPluginDatabase } from '../../../database/Plugin/wrap-plugin-database'
import { omit } from 'lodash-es'

export const PoolDatabase = createPluginDatabase<PoolRecordInDatabase>(ITO_PluginID)

export async function getPoolsFromDB(rpids: string[]) {
    const records: PoolRecord[] = []
    for await (const record of PoolDatabase.iterate('ito-pool')) {
        if (rpids.includes(record.payload.pid)) records.push(PoolRecordOutDB(record))
    }
    return records
}

export async function getPoolFromDB(rpid: string) {
    const record = await PoolDatabase.get('ito-pool', rpid)
    return record ? PoolRecordOutDB(record) : undefined
}

export async function addPoolIntoDB(record: PoolRecord) {
    if (await PoolDatabase.has('ito-pool', record.id)) return
    return PoolDatabase.add(PoolRecordIntoDB(record))
}

export function removePoolFromDB(rpid: string) {
    return PoolDatabase.remove('ito-pool', rpid)
}

function PoolRecordIntoDB(x: PoolRecord) {
    const record = x as PoolRecordInDatabase
    record.type = 'ito-pool'
    return record
}

function PoolRecordOutDB(x: PoolRecordInDatabase): PoolRecord {
    const record = x
    return omit(record, ['type'])
}
