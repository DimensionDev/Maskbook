import type { RedPacketRecord, RedPacketHistory } from './types'
import { RedPacketMessage } from './messages'
import * as database from './database'
import { getChainId } from '../../extension/background-script/SettingsService'
import * as subgraph from './apis'

export async function discoverRedPacket(record: RedPacketRecord) {
    database.addRedPacket(record)
    RedPacketMessage.events.redPacketUpdated.sendToAll(undefined)
}

export async function getRedPacketHistory(address: string) {
    const chainId = await getChainId()
    const redPacketsFromChain = await subgraph.getAllRedPackets(address)
    const redPacketsFromDB = await database.getRedPacketsHistory(redPacketsFromChain.map((x) => x.txid))
    return redPacketsFromChain.reduce((acc, history) => {
        const record = redPacketsFromDB.find((y) => y.id === history.txid)
        if (history.chain_id === chainId && record) {
            history.payload.password = record.password
            history.password = record.password
            acc.push(history)
        }
        return acc
    }, [] as RedPacketHistory[])
}
