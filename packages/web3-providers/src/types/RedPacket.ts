import type { Transaction } from '@masknet/web3-shared-base'

export namespace RedPacketBaseAPI {
    export interface Provider<ChainId, SchemaType> {
        getHistoryTransactions?: (
            chainId: ChainId,
            senderAddress: string,
            contractAddress: string,
            methodId: string,
            startBlock: number,
            endBlock: number,
        ) => Promise<Array<Transaction<ChainId, SchemaType>> | undefined>
    }
}
