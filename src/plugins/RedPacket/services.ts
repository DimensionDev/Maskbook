import * as jwt from 'jsonwebtoken'
import type { RedPacketRecord, RedPacketJSONPayload, History } from './types'
import { RED_PACKET_HISTORY_URL } from './constants'
import { PluginMessageCenter } from '../PluginMessages'
import * as database from './database'
import { resolveChainName } from '../../web3/pipes'
import { getChainId } from '../../extension/background-script/EthereumService'
import { web3 } from '../../extension/background-script/EthereumServices/web3'
import type { ChainId } from '../../web3/types'

export async function claimRedPacket(
    from: string,
    rpid: string,
    password: string,
): Promise<{ claim_transaction_hash: string }> {
    const host = 'https://redpacket.gives'
    const x = 'a3323cd1-fa42-44cd-b053-e474365ab3da'

    const network = resolveChainName(await getChainId()).toLowerCase()
    const auth = await fetch(`${host}/hi?id=${from}&network=${network}`)
    if (!auth.ok) throw new Error('Auth failed')
    const verify = await auth.text()

    const jwt_encoded: {
        password: string
        recipient: string
        redpacket_id: string
        validation: string
        signature: string
    } = {
        password,
        recipient: from,
        redpacket_id: rpid,
        validation: web3.utils.sha3(from)!,
        // TODO: This is not working on MetaMask cause it require the private key.
        signature: await web3.eth.sign(verify, from),
    }
    const pay = await fetch(
        `${host}/please?payload=${jwt.sign(jwt_encoded, x, { algorithm: 'HS256' })}&network=${network}`,
    )
    if (!pay.ok) throw new Error('Pay failed')
    return { claim_transaction_hash: await pay.text() }
}

export async function discoverRedPacket(from: string, payload: RedPacketJSONPayload) {
    if (!payload.rpid) return
    const original = await database.getRedPacket(payload.rpid)
    if (original) return
    const record: RedPacketRecord = {
        id: payload.rpid,
        from,
        payload,
    }
    database.addRedPacket(record)
    PluginMessageCenter.emit('maskbook.red_packets.update', undefined)
}

export function getRedPacketsFromDB() {
    return database.getRedPackets()
}

export async function getRedPacketsFromChain(from: string, startBlock: number) {
    const url = new URL(RED_PACKET_HISTORY_URL)
    url.searchParams.set('chainId', String(await getChainId()))
    url.searchParams.set('from', from)
    url.searchParams.set('startBlock', String(startBlock))
    url.searchParams.set('endBlock', 'latest')
    const response = await fetch(url.toString())
    if (response.status !== 200) return []
    return response.json() as Promise<History.RedPacketRecord[]>
}
