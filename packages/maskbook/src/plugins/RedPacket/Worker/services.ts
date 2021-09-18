import type { ChainId } from '@masknet/web3-shared'
import type { RedPacketRecord } from '../types'
import * as subgraph from './apis/subgraph'
import * as database from './database'
import * as nftDb from './databaseForNft'

export { addRedPacketNft, getRedPacketNft, updateRedPacketNft } from './databaseForNft'

export async function discoverRedPacket(record: RedPacketRecord) {
    if (record.contract_version === 1) {
        const txid = await subgraph.getRedPacketTxid(record.id)
        if (!txid) return
        record.id = txid
    }
    database.addRedPacket(record)
}

export async function getRedPacketHistory(address: string, chainId: ChainId) {
    const redpacketsFromSubgraph = await subgraph.getRedPacketHistory(address, chainId)
    const redpacketsFromDatabase = await database.getAllRedpackets(redpacketsFromSubgraph.map((x) => x.txid))
    return redpacketsFromSubgraph.map((x) => {
        const record = redpacketsFromDatabase.find((y) => y.id === x.txid)
        if (!record) return x
        return {
            ...x,
            password: record.password,
            payload: {
                ...x.payload,
                password: record.password,
            },
        }
    })
}

export async function getNftRedPacketHistory(address: string, chainId: ChainId, page: number) {
    const histories = await subgraph.getNftRedPacketHistory(address, page)
    const historiesWithPassword = []
    for (const history of histories) {
        const record = await nftDb.getRedPacketNft(history.txid)
        if (history.chain_id === chainId && record) {
            history.password = record.password
            history.payload.password = record.password
        } else {
            history.password = ''
            history.payload.password = ''
        }
        historiesWithPassword.push(history)
    }
    return historiesWithPassword
}
