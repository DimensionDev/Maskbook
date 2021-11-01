import type { RedPacketNftRecord, RedPacketNftRecordInDatabase } from '../types'
import * as database from './databaseForNft'

export async function addRedPacketNft(record: RedPacketNftRecord) {
    database.addRedPacketNft(record)
}

export async function updateRedPacketNft(newRecord: RedPacketNftRecordInDatabase) {
    database.updateRedPacketNft(newRecord)
}
