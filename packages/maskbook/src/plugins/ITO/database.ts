import type { PoolRecord, PoolRecordInDatabase } from './types'
import { ITO_PluginID } from './constants'
import { createPluginDatabase } from '../../database/Plugin/wrap-plugin-database'
import { asyncIteratorToArray } from '../../utils/type-transform/asyncIteratorHelpers'
import { omit } from 'lodash-es'

export const PoolDatabase = createPluginDatabase<PoolRecordInDatabase>(ITO_PluginID)

export function getPoolsFromDB() {
    return asyncIteratorToArray(PoolDatabase.iterate('ito-pool'))
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
