import { v4 as uuid } from 'uuid'
import { omit } from 'lodash-es'
import type { LotteryRecord, LotteryRecordInDatabase, LotteryJSONPayload } from './types'
import { PluginMessageCenter } from '../PluginMessages'
import { LotteryDatabase } from './database'

export async function getLotteryByID(lyid: string) {
    for await (const i of LotteryDatabase.iterate('lottery')) {
        if (i.lyid === lyid) return LotteryRecordOutDB(i)
    }
    return null
}

export async function addLottery(from: string, payload: LotteryJSONPayload) {
    if (!payload.lyid) return
    const original = await getLotteryByID(payload.lyid)
    if (original) original
    const record: LotteryRecord = {
        id: uuid(),
        lyid: payload.lyid,
        from,
        payload,
    }
    await LotteryDatabase.add(LotteryRecordIntoDB(record))
    PluginMessageCenter.emit('maskbook.lottery.update', undefined)
    return record
}

export async function removeLottery(lyid: string) {
    // const t = await createLotteryTransaction('readwrite')
    // TODO
    PluginMessageCenter.emit('maskbook.lottery.update', undefined)
}

export async function getInboundLotterys() {
    return []
}

export async function getOutboundLotterys(from: string) {}

function LotteryRecordOutDB(x: LotteryRecordInDatabase): LotteryRecord {
    const record = x
    return omit(record, ['type'])
}
function LotteryRecordIntoDB(x: LotteryRecord): LotteryRecordInDatabase {
    const record = x as LotteryRecordInDatabase
    record.type = 'lottery'
    return record
}
