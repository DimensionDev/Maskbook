import type { ChainId } from '@masknet/web3-shared-evm'
import {
    type RedPacketRecord,
    type RedPacketJSONPayloadFromChain,
    type NftRedPacketJSONPayload,
} from '@masknet/web3-providers/types'
import { EMPTY_LIST } from '@masknet/shared-base'
import * as database from './database.js'
import * as nftDb from './databaseForNft.js'

export { addRedPacketNft, getRedPacketNft, updateRedPacketNft } from './databaseForNft.js'

export async function addRedPacket(record: RedPacketRecord, chainId: ChainId) {
    await database.addRedPacket(record)
}

export async function getRedPacketHistoryFromDatabase(redpacketsFromChain: RedPacketJSONPayloadFromChain[]) {
    // #region Inject password from database
    const redpacketsFromDatabase: RedPacketRecord[] = await database.getAllRedpackets(
        redpacketsFromChain.map((x) => x.txid),
    )
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
    let historiesWithPassword: NftRedPacketJSONPayload[] = EMPTY_LIST

    for (const history of histories) {
        const record = await nftDb.getRedPacketNft(history.txid)

        historiesWithPassword = historiesWithPassword.concat({ ...history, password: record?.password || '' })
    }
    return historiesWithPassword
}
