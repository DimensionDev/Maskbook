import type { ChainId } from '@masknet/web3-shared-evm'
import type { RedPacketRecord, RedPacketJSONPayloadFromChain } from '../types.js'
import * as subgraph from './apis/subgraph.js'
import * as database from './database.js'
import * as nftDb from './databaseForNft.js'

export { addRedPacketNft, getRedPacketNft, updateRedPacketNft } from './databaseForNft.js'

export async function discoverRedPacket(record: RedPacketRecord, chainId: ChainId) {
    if (record.contract_version === 1) {
        const txid = await subgraph.getRedPacketTxid(chainId, record.id)
        if (!txid) return
        record.id = txid
    }
    await database.addRedPacket(record)
}

export async function getRedPacketHistoryFromDatabase(redpacketsFromChain: RedPacketJSONPayloadFromChain[]) {
    // #region Inject password from database
    const redpacketsFromDatabase = await database.getAllRedpackets(redpacketsFromChain.map((x) => x.txid))
    return redpacketsFromChain.map((x) => {
        const record = redpacketsFromDatabase.find((y) => y.id === x.txid)
        if (!record) return x
        return {
            ...x,
            password: record.password,
        }
    })
    // #endregion
}

export async function getNftRedPacketHistory(address: string, chainId: ChainId, page: number, pageSize?: number) {
    const histories = await subgraph.getNftRedPacketHistory(chainId, address, page, pageSize)
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
