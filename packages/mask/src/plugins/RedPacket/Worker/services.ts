import type { ChainId } from '@masknet/web3-shared-evm'
import {
    type RedPacketRecord,
    type RedPacketJSONPayloadFromChain,
    type NftRedPacketJSONPayload,
} from '@masknet/web3-providers/types'
import * as database from './database.js'
import * as nftDb from './databaseForNft.js'

export { addRedPacketNft, getRedPacketNft, updateRedPacketNft } from './databaseForNft.js'

export async function addRedPacket(record: RedPacketRecord, chainId: ChainId) {
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

export async function getNftRedPacketHistory(histories: NftRedPacketJSONPayload[]) {
    const historiesWithPassword = []
    for (const history of histories) {
        const record = await nftDb.getRedPacketNft(history.txid)
        if (record) {
            history.password = record.password
        } else {
            history.password = ''
        }
        historiesWithPassword.push(history)
    }
    return historiesWithPassword
}
