import urlcat from 'urlcat'
import { compact, last, uniq } from 'lodash-es'
import { createPageable, createIndicator, type Pageable, createNextIndicator, EMPTY_LIST } from '@masknet/shared-base'
import { type Transaction } from '@masknet/web3-shared-base'
import { ChainId, type SchemaType } from '@masknet/web3-shared-evm'
import { formatTransactions, getDebankChain, resolveDeBankAssetIdReversed } from '../helpers.js'
import type { HistoryRecord } from '../types.js'
import { DEBANK_OPEN_API } from '../constants.js'
import { fetchSquashedJSON } from '../../helpers/fetchJSON.js'
import type { HistoryAPI, BaseHubOptions } from '../../entry-types.js'
import { evm } from '../../Manager/registry.js'

const PRESET_CHAIN_IDS = 'eth,aurora,bsc,matic,pls,ftm,op,klay,nova,celo,astar,boba'.split(',')
class DeBankHistoryAPI implements HistoryAPI.Provider<ChainId, SchemaType> {
    // Collect from https://docs.cloud.debank.com/en/readme/api-pro-reference/chain#returns-1
    private getChainIds() {
        const networks = evm.state?.Network?.networks?.getCurrentValue()
        // Fallback to commonly used chains
        if (!networks) return PRESET_CHAIN_IDS
        const RUNTIME_CHAIN_IDS = networks.map((x) => getDebankChain(x.chainId))
        return compact(uniq([...RUNTIME_CHAIN_IDS, PRESET_CHAIN_IDS])).join(',')
    }
    async getTransactions(
        address: string,
        { chainId = ChainId.Mainnet, indicator, size = 20 }: BaseHubOptions<ChainId> = {},
    ): Promise<Pageable<Transaction<ChainId, SchemaType>>> {
        const CHAIN_ID = getDebankChain(chainId)
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
        { indicator, size = 20 }: BaseHubOptions<ChainId> = {},
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
export const DeBankHistory = new DeBankHistoryAPI()
