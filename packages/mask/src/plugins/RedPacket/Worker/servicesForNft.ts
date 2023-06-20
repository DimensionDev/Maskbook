import type { RedPacketNftRecord, RedPacketNftRecordInDatabase } from '@masknet/web3-providers/types'
import * as database from './databaseForNft.js'

export async function addRedPacketNft(record: RedPacketNftRecord) {
    database.addRedPacketNft(record)
}

export async function updateRedPacketNft(newRecord: RedPacketNftRecordInDatabase) {
    database.updateRedPacketNft(newRecord)
}
