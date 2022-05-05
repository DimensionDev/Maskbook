import type { PoolRecord, PoolRecordInDatabase } from '../types'
import { omit } from 'lodash-unified'
import type { Plugin } from '@masknet/plugin-infra'

export let PoolDatabase: Plugin.Worker.DatabaseStorage<PoolRecordInDatabase>

export function setupDatabase(x: typeof PoolDatabase) {
    PoolDatabase = x
}

export async function getAllPoolsAsSeller(ids: string[]) {
    const records: PoolRecord[] = []
    for await (const { value: record } of PoolDatabase.iterate('ito-pool')) {
        if (ids.includes(record.payload.pid)) records.push(PoolRecordOutDB(record))
    }
    return records
}

export async function getPoolFromDB(id: string) {
    const record = await PoolDatabase.get('ito-pool', id)
    return record ? PoolRecordOutDB(record) : undefined
}

export async function addPoolIntoDB(record: PoolRecord) {
    if (await PoolDatabase.has('ito-pool', record.id)) return
    return PoolDatabase.add(PoolRecordIntoDB(record))
}

export function removePoolFromDB(id: string) {
    return PoolDatabase.remove('ito-pool', id)
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
