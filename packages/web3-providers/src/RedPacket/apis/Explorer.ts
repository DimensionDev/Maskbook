import type { Transaction } from '@masknet/web3-shared-base'
import type { RedPacketBaseAPI } from '../../types/RedPacket.js'

export class ExplorerAPI<ChainId, SchemaType> implements RedPacketBaseAPI.DataSourceProvider<ChainId, SchemaType> {
    getHistories(): Promise<Array<Transaction<ChainId, SchemaType>>> {
        throw new Error('Method not implemented.')
    }
}
