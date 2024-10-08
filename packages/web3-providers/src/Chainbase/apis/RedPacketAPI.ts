import urlcat from 'urlcat'
import { type Transaction } from '@masknet/web3-shared-base'
import {
    asyncIteratorToArray,
    createIndicator,
    createNextIndicator,
    createPageable,
    pageableToIterator,
} from '@masknet/shared-base'
import { ChainId, type SchemaType } from '@masknet/web3-shared-evm'
import { TRANSACTIONS_BY_CONTRACT_METHOD_ENDPOINT, MAX_SIZE_PER_PAGE } from '../constants.js'
import type { Tx } from '../types.js'
import { fetchJSON } from '../../helpers/fetchJSON.js'
import type { RedPacketBaseAPI } from '../../entry-types.js'

export class ChainbaseRedPacketAPI implements RedPacketBaseAPI.Provider<ChainId, SchemaType> {
    /**
     * @see https://docs.chainbase.com/reference/supported-chains
     */
    static isSupportedChain(chainId: ChainId) {
        const supported = [
            ChainId.Mainnet,
            ChainId.Polygon,
            ChainId.BSC,
            ChainId.Avalanche,
            ChainId.Arbitrum,
            ChainId.Base,
            /** zkSync */ 324,
        ].includes(chainId)
        console.error('Unsupported chain by ChainBase, see https://docs.chainbase.com/reference/supported-chains')
        return supported
    }
    static async getHistoryTransactions(
        chainId: ChainId,
        senderAddress: string,
        contractAddress: string,
        methodId: string,
    ): Promise<Array<Transaction<ChainId, SchemaType>> | undefined> {
        const txes = await asyncIteratorToArray(
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

        if (!txes?.length) return

        return txes
            .sort((a, b) => new Date(b.block_timestamp).getTime() - new Date(a.block_timestamp).getTime())
            .map((x) => {
                return {
                    input: x.input,
                    to: x.to_address,
                    from: x.from_address,
                    hash: x.transaction_hash,
                    chainId,
                    blockNumber: Number(x.block_number),
                } as Transaction<ChainId, SchemaType>
            })
    }
}
export const ChainbaseRedPacket = new ChainbaseRedPacketAPI()
