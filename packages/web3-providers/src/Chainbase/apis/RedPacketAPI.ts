import urlcat from 'urlcat'
import {
    Transaction,
    createIndicator,
    createNextIndicator,
    createPageable,
    pageableToIterator,
} from '@masknet/web3-shared-base'
import { asyncIteratorToArray } from '@masknet/shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { TRANSACTIONS_BY_CONTRACT_METHOD_ENDPOINT, MAX_SIZE_PER_PAGE } from '../constants.js'
import type { Tx } from '../types.js'
import type { RedPacketBaseAPI } from '../../entry-types.js'
import { fetchJSON } from '../../entry-helpers.js'

export class ChainbaseRedPacketAPI implements RedPacketBaseAPI.Provider<ChainId, SchemaType> {
    async getHistories(
        chainId: ChainId,
        senderAddress: string,
        contractAddress: string,
        methodId: string,
        startBlock?: number,
        endBlock?: number,
    ): Promise<Array<Transaction<ChainId, SchemaType>> | undefined> {
        try {
            const txs = await asyncIteratorToArray(
                pageableToIterator(async (indicator) => {
                    const { records } = await fetchJSON<{ records: { data: { result: Tx[] } } }>(
                        urlcat(TRANSACTIONS_BY_CONTRACT_METHOD_ENDPOINT, {
                            senderAddress,
                            contractAddress,
                            chainId,
                            methodId: `${methodId}%`, // '%' for sql string match.
                            size: MAX_SIZE_PER_PAGE,
                            offset: Number(indicator?.id ?? 0) * MAX_SIZE_PER_PAGE,
                        }),
                    )

                    return createPageable(
                        records.data.result,
                        createIndicator(indicator),
                        records.data.result.length === 0 ? undefined : createNextIndicator(indicator),
                    )
                }),
            )

            if (!txs) return

            return txs
                .sort((a, b) => new Date(b.block_timestamp).getTime() - new Date(a.block_timestamp).getTime())
                .map(
                    (x) =>
                        ({
                            input: x.input,
                            to: x.to_address,
                            from: x.from_address,
                            hash: x.transaction_hash,
                            blockNumber: Number(x.block_number),
                        } as Transaction<ChainId, SchemaType>),
                )
        } catch {
            return
        }
    }
}
