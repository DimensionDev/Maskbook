import urlcat from 'urlcat'
import { compact, last } from 'lodash-es'
import { createPageable, createIndicator, type Pageable, createNextIndicator, EMPTY_LIST } from '@masknet/shared-base'
import { type Transaction } from '@masknet/web3-shared-base'
import { ChainId, getDeBankConstants, type SchemaType } from '@masknet/web3-shared-evm'
import { formatTransactions, resolveDeBankAssetIdReversed } from '../helpers.js'
import type { HistoryRecord } from '../types.js'
import { CHIAN_ID_TO_DEBANK_CHAIN_MAP, DEBANK_OPEN_API } from '../constants.js'
import { fetchSquashedJSON } from '../../helpers/fetchJSON.js'
import type { HistoryAPI, HubOptions_Base } from '../../entry-types.js'
import { Web3StateRef } from '../../Web3/EVM/apis/Web3StateAPI.js'

export class DeBankHistoryAPI implements HistoryAPI.Provider<ChainId, SchemaType> {
    // Collect from https://docs.cloud.debank.com/en/readme/api-pro-reference/chain#returns-1
    private getChainIds() {
        const networks = Web3StateRef.value.Network?.networks?.getCurrentValue()
        // Fallback to commonly used chains
        if (!networks) return 'eth,aurora,bsc,matic,pls,ftm,op,klay,nova,celo,astar,boba'
        return compact(networks.map((x) => CHIAN_ID_TO_DEBANK_CHAIN_MAP[x.chainId])).join(',')
    }
    async getTransactions(
        address: string,
        { chainId = ChainId.Mainnet, indicator, size = 20 }: HubOptions_Base<ChainId> = {},
    ): Promise<Pageable<Transaction<ChainId, SchemaType>>> {
        const { CHAIN_ID = '' } = getDeBankConstants(chainId)
        if (!CHAIN_ID) return createPageable(EMPTY_LIST, createIndicator(indicator))

        const result = await fetchSquashedJSON<HistoryRecord>(
            urlcat(DEBANK_OPEN_API, '/v1/user/history_list', {
                id: address.toLowerCase(),
                chain_id: resolveDeBankAssetIdReversed(CHAIN_ID),
                page_count: size,
                start_time: indicator?.id,
            }),
        )
        const transactions = formatTransactions(result, address)
        const timeStamp = last(result.history_list)?.time_at
        return createPageable(
            transactions,
            createIndicator(indicator),
            transactions.length > 0 ? createNextIndicator(indicator, timeStamp?.toString()) : undefined,
        )
    }

    async getAllTransactions(
        address: string,
        { indicator, size = 20 }: HubOptions_Base<ChainId> = {},
    ): Promise<Pageable<Transaction<ChainId, SchemaType>>> {
        const result = await fetchSquashedJSON<HistoryRecord>(
            urlcat(DEBANK_OPEN_API, '/v1/user/all_history_list', {
                id: address.toLowerCase(),
                page_count: size,
                start_time: indicator?.id,
                chain_ids: this.getChainIds(),
            }),
        )
        const transactions = formatTransactions(result, address)
        const timeStamp = last(result.history_list)?.time_at
        return createPageable(
            transactions,
            createIndicator(indicator),
            transactions.length > 0 ? createNextIndicator(indicator, timeStamp?.toString()) : undefined,
        )
    }
}
