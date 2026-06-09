import type { RedPacketRecord } from '@masknet/web3-providers/types'
import * as database from './database.js'

export async function addRedPacket(record: RedPacketRecord) {
    await database.addRedPacket(record)
}

export async function getRedPacketRecord(txId: string) {
    return database.getRedPacket(txId)
}
