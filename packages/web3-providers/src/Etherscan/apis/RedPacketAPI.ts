import urlcat from 'urlcat'
import { isSameAddress, type Transaction } from '@masknet/web3-shared-base'
import { EtherscanURL } from '@masknet/web3-shared-evm'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { fetchJSON } from '../../helpers/fetchJSON.js'
import type { RedPacketBaseAPI } from '../../entry-types.js'

export class EtherscanRedPacketAPI implements RedPacketBaseAPI.Provider<ChainId, SchemaType> {
    async getHistoryTransactions(
        chainId: ChainId,
        senderAddress: string,
        contractAddress: string,
        methodId: string,
        startBlock: number,
        endBlock: number,
    ): Promise<Array<Transaction<ChainId, SchemaType>> | undefined> {
        if (!senderAddress || !contractAddress || !startBlock || !endBlock || !methodId) return

        try {
            const { result } = await fetchJSON<{ result: Array<Transaction<ChainId, SchemaType>> }>(
                urlcat(EtherscanURL.from(chainId), {
                    action: 'txlist',
                    module: 'account',
                    sort: 'desc',
                    startBlock,
                    endBlock,
                    address: contractAddress,
                    chain_id: chainId,
                }),
            )

            if (!result) return

            return result
                .filter(
                    (x) => x.methodId?.toLowerCase() === methodId.toLowerCase() && isSameAddress(x.from, senderAddress),
                )
                .map((x) => ({ ...x, chainId }))
        } catch {
            return
        }
    }
}
