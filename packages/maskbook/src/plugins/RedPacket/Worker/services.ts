import type { RedPacketRecord } from '../types'
import * as database from './database'
import type { ChainId } from '@masknet/web3-shared'
import * as subgraph from './apis'

export { addRedPacketNft, getRedPacketNft } from './databaseForNft'

export async function discoverRedPacket(record: RedPacketRecord) {
    if (record.contract_version === 1) {
        const txid = await subgraph.getRedPacketTxid(record.id)
        if (!txid) return
        record.id = txid
    }
    database.addRedPacket(record)
}

export async function getRedPacketHistoryWithPassword(address: string, chainId: ChainId) {
    const histories = await subgraph.getRedPacketHistory(address, chainId)
    const historiesWithPassword = []
    for (const history of histories) {
        await database.updateV1ToV2(history)
        const record = await database.getRedPacket(history.txid)
        if (history.chain_id === chainId && record) {
            history.payload.password = history.password = record.password
        } else {
            history.payload.password = history.password = ''
        }
        historiesWithPassword.push(history)
    }
    return historiesWithPassword
}
