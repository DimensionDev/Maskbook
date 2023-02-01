import type { Transaction } from '@masknet/web3-shared-base'
import type { RedPacketBaseAPI } from '../../types/RedPacket.js'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'

export class ChainbaseAPI implements RedPacketBaseAPI.DataSourceProvider<ChainId, SchemaType> {
    getHistories(
        chainId: ChainId,
        senderAddress: string,
        contractAddress: string,
        methodId: string,
        startBlock?: number,
        endBlock?: number,
    ): Promise<Array<Transaction<ChainId, SchemaType>>> {
        throw new Error('Method not implemented.')
    }
}
