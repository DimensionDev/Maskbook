import type { RedPacketRecord, RedPacketJSONPayload, History } from './types'
import { RED_PACKET_HISTORY_URL } from './constants'
import { RedPacketMessage } from './messages'
import * as database from './database'
import Services from '../../extension/service'

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

export function getRedPacketsFromDB() {
    return database.getRedPackets()
}

export function getRedPacketFromDB(rpid: string) {
    return database.getRedPacket(rpid)
}

export async function getRedPacketsFromChain(from: string, startBlock: number) {
    const url = new URL(RED_PACKET_HISTORY_URL)
    url.searchParams.set('chainId', String(await Services.Ethereum.getChainId(from)))
    url.searchParams.set('from', from)
    url.searchParams.set('startBlock', String(startBlock))
    url.searchParams.set('endBlock', 'latest')
    const response = await fetch(url.toString())
    if (response.status !== 200) return []
    return response.json() as Promise<History.RedPacketRecord[]>
}
