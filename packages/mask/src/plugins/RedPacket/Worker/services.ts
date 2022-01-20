import { ChainId, getRedPacketConstants } from '@masknet/web3-shared-evm'
import type { RedPacketRecord, RedPacketJSONPayload, RedPacketJSONPayloadFromChain } from '../types'
import * as subgraph from './apis/subgraph'
import * as chain from './apis/chain'
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

export async function getRedPacketHistory(address: string, chainId: ChainId, endBlock: number) {
    const { HAPPY_RED_PACKET_ADDRESS_V4_BLOCK_HEIGHT } = getRedPacketConstants(chainId)

    // #region Get data from thegraph
    const redpacketsFromSubgraph = await subgraph.getRedPacketHistory(address, chainId)
    // #endregion

    // #region Get data from chain which has not been synced by thegraph.
    const latestPoolFromSubgraph = redpacketsFromSubgraph[0]
    const startBlockNumberFromChain = getLatestBlockNumberFromSubgraph(
        latestPoolFromSubgraph,
        HAPPY_RED_PACKET_ADDRESS_V4_BLOCK_HEIGHT,
    )
    const redpacketsFromChain = await chain.getRedPacketHistory(chainId, startBlockNumberFromChain, endBlock, address)
    // #endregion

    const redpacketsFromNetwork = (
        redpacketsFromChain as (RedPacketJSONPayloadFromChain | RedPacketJSONPayload)[]
    ).concat(redpacketsFromSubgraph)

    // #region Inject password from database
    const redpacketsFromDatabase = await database.getAllRedpackets(redpacketsFromNetwork.map((x) => x.txid))
    return redpacketsFromNetwork.map((x) => {
        const record = redpacketsFromDatabase.find((y) => y.id === x.txid)
        if (!record) return x
        return {
            ...x,
            password: record.password,
        }
    })
    // #endregion
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

function getLatestBlockNumberFromSubgraph(
    redpacketFromSubgraph: RedPacketJSONPayload | undefined,

    creationBlockNumber: number | undefined,
) {
    return redpacketFromSubgraph ? redpacketFromSubgraph.block_number! + 1 : creationBlockNumber
}
