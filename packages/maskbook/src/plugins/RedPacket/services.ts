import type { RedPacketRecord, RedPacketJSONPayload, RedPacketRecordWithHistory } from './types'
import { RedPacketMessage } from './messages'
import * as database from './database'
import { getChainId } from '../../extension/background-script/SettingsService'
import * as subgraph from './apis'

export async function discoverRedPacket(from: string, payload: RedPacketJSONPayload) {
    if (!payload.rpid) return
    if (!payload.password) return
    const record_ = await database.getRedPacket(payload.rpid)
    const record: RedPacketRecord = {
        id: payload.rpid,
        from: record_?.from || from,
        payload: record_?.payload ?? payload,
    }
    database.addRedPacket(record)
    RedPacketMessage.events.redPacketUpdated.sendToAll(undefined)
}

export async function getAllRedPackets(address: string) {
    const chainId = await getChainId()
    const redPacketsFromChain = await subgraph.getAllRedPackets(address)
    const redPacketsFromDB = await database.getRedPacketsHistory(redPacketsFromChain.map((x) => x.rpid))
    return redPacketsFromChain.reduce((acc, history) => {
        const record = redPacketsFromDB.find((y) => y.payload.rpid === history.rpid)
        if (history.chain_id === chainId && record) {
            acc.push({
                history,
                record,
            })
        }
        return acc
    }, [] as RedPacketRecordWithHistory[])
}
