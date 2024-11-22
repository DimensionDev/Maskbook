import { type RedPacketJSONPayloadFromChain, type RedPacketRecord } from '@masknet/web3-providers/types'
import type { ChainId } from '@masknet/web3-shared-evm'
import * as database from './database.js'

export async function addRedPacket(record: RedPacketRecord, chainId: ChainId) {
    await database.addRedPacket(record)
}

export async function getRedPacketRecord(txId: string) {
    return database.getRedPacket(txId)
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
