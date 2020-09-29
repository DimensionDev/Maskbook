import type { RedPacketRecord, RedPacketRecordInDatabase, RedPacketJSONPayload, History } from './types'
import { RED_PACKET_HISTORY_URL } from './constants'

/**
 * Note: Only call this for other one's redpacket or it will duplicate in the database!
 */
export async function discoverRedPacket(foundInURL: string, payload: RedPacketJSONPayload) {
    console.log('DEBUG: discoverRedPacket')
    console.log({
        payload,
        foundInURL,
    })
    // const t = await createRedPacketTransaction('readwrite')
    // const original = await t.getByIndex('red_packet_id', payload.rpid)
    // if (original) return RedPacketRecordOutDB(original)
    // const record: RedPacketRecord = {
    //     aes_version: 1,
    //     contract_address: payload.contract_address,
    //     contract_version: payload.contract_version,
    //     duration: payload.duration,
    //     id: uuid(),
    //     is_random: payload.is_random,
    //     network: payload.network || EthereumNetwork.Mainnet,
    //     send_message: payload.sender.message,
    //     send_total: new BigNumber(payload.total),
    //     sender_address: payload.sender.address,
    //     sender_name: payload.sender.name,
    //     status: RedPacketStatus.incoming,
    //     password: payload.password,
    //     token_type: payload.token_type,
    //     block_creation_time: new Date(payload.creation_time),
    //     erc20_token: payload.token?.address,
    //     red_packet_id: payload.rpid,
    //     raw_payload: payload,
    //     _found_in_url_: foundInURL,
    //     received_time: new Date(),
    //     shares: new BigNumber(payload.shares),
    // }
    // await t.add(RedPacketRecordIntoDB(record))
    // PluginMessageCenter.emit('maskbook.red_packets.update', undefined)
    // return record
}

export async function getInboundRedPackets() {
    return []
}

export async function getOutboundRedPackets(from: string) {
    const url = new URL(RED_PACKET_HISTORY_URL)
    url.searchParams.set('from', from)
    const response = await fetch(url.toString())
    if (response.status !== 200) {
        return undefined
    }
    // return response.json() as Promise<History.RecordType[]>
    return response.json() as any
}

function RedPacketRecordOutDB(x: RedPacketRecordInDatabase): RedPacketRecord {
    return x as RedPacketRecord
}
function RedPacketRecordIntoDB(x: RedPacketRecord): RedPacketRecordInDatabase {
    return x as RedPacketRecordInDatabase
}
