import urlcat from 'urlcat'
import { first } from 'lodash-es'
import { isSameAddress, Transaction } from '@masknet/web3-shared-base'
import { getExplorerConstants } from '@masknet/web3-shared-evm'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import type { RedPacketBaseAPI } from '../../types/RedPacket.js'

export class ExplorerAPI implements RedPacketBaseAPI.DataSourceProvider<ChainId, SchemaType> {
    async getHistories(
        chainId: ChainId,
        senderAddress: string,
        contractAddress: string,
        methodId: string,
        startBlock?: number,
        endBlock?: number,
    ): Promise<Array<Transaction<ChainId, SchemaType>> | undefined> {
        const { EXPLORER_API, API_KEYS = [] } = getExplorerConstants(chainId)
        if (!EXPLORER_API || !senderAddress || !contractAddress || !startBlock || !endBlock || !methodId) return

        const response = await fetch(
            urlcat(EXPLORER_API, {
                apikey: first(API_KEYS),
                action: 'txlist',
                module: 'account',
                sort: 'desc',
                startBlock,
                endBlock,
                address: contractAddress,
            }),
        )

        if (!response.ok) return

        const {
            result,
        }: {
            result: Array<Transaction<ChainId, SchemaType>>
        } = await response.json()

        return result.filter(
            (x) => x.methodId?.toLowerCase() === methodId.toLowerCase() && isSameAddress(x.from, senderAddress),
        )
    }
}
