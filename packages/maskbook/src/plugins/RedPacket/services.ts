import * as jwt from 'jsonwebtoken'
import { sha256 } from 'ethers/lib/utils'
import type { RedPacketRecord, RedPacketJSONPayload, History } from './types'
import { RED_PACKET_HISTORY_URL } from './constants'
import { RedPacketMessage } from './messages'
import * as database from './database'
import { resolveChainName } from '../../web3/pipes'
import Services from '../../extension/service'

export async function claimRedPacket(
    from: string,
    rpid: string,
    password: string,
): Promise<{ claim_transaction_hash: string }> {
    const host = 'https://redpacket.gives'
    const x = 'a3323cd1-fa42-44cd-b053-e474365ab3da'

    const chainId = await Services.Ethereum.getChainId(from)
    const network = resolveChainName(chainId).toLowerCase()
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
        validation: sha256(from)!,
        // TODO: This is not working on MetaMask cause it require the private key.
        signature: await Services.Ethereum.sign(verify, from, chainId),
    }
    const pay = await fetch(
        `${host}/please?payload=${jwt.sign(jwt_encoded, x, { algorithm: 'HS256' })}&network=${network}`,
    )
    if (!pay.ok) throw new Error('Pay failed')
    return { claim_transaction_hash: await pay.text() }
}

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
