import type { RedPacketNftRecord } from '../types'
import * as database from './databaseForNft'

export async function addRedPacketNft(record: RedPacketNftRecord) {
    database.addRedPacketNft(record)
}

export async function updateRedPacketNftPassword(id: string, password: string) {
    database.updateRedPacketNftPassword(id, password)
}
