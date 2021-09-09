import type { RedPacketNftRecord } from '../types'
import * as database from './databaseForNft'
import type { ChainId } from '@masknet/web3-shared'

export async function addRedPacketNft(record: RedPacketNftRecord) {
    database.addRedPacketNft(record)
}

export async function updateRedPacketNftPassword(id: string, password: string) {
    database.updateRedPacketNftPassword(id, password)
}

export async function getRedPacketNftHistoryWithPassword(address: string, chainId: ChainId) {
    //...
}
