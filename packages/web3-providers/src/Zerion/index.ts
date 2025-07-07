import {
    createIndicator,
    createNextIndicator,
    createPageable,
    EMPTY_LIST,
    type Pageable,
    type PageIndicator,
} from '@masknet/shared-base'
import { fetchJSON } from '@masknet/web3-providers/helpers'
import { isSameAddress, type Transaction } from '@masknet/web3-shared-base'
import { type ChainId, type SchemaType } from '@masknet/web3-shared-evm'
import { compact, unionWith } from 'lodash-es'
import urlcat from 'urlcat'
import type { BaseHubOptions, FungibleTokenAPI, HistoryAPI } from '../entry-types.js'
import { getNativeAssets } from '../helpers/getNativeAssets.js'
import { getAssetsList } from './base-api.js'
import { formatAsset, formatRestTransaction, isValidAsset, zerionChainIdResolver } from './helpers.js'
import type { TransactionsResponse } from './reset-types.js'

const filterAssetType = ['compound', 'trash', 'uniswap', 'uniswap-v2', 'nft']
const ZERION_REST_API = 'https://zerion-proxy.r2d2.to/'

class ZerionAPI implements FungibleTokenAPI.Provider<ChainId, SchemaType>, HistoryAPI.Provider<ChainId, SchemaType> {
    async getAssets(address: string, options?: BaseHubOptions<ChainId>) {
        const { meta, payload } = await getAssetsList(address, 'positions')
        if (meta.status !== 'ok') return createPageable(EMPTY_LIST, createIndicator(options?.indicator))

        const assets = payload.positions?.positions
            .filter(
                (x) =>
                    x.type === 'asset' &&
                    x.asset.icon_url &&
                    x.asset.is_displayable &&
                    !filterAssetType.includes(x.asset.type) &&
                    isValidAsset(x) &&
                    zerionChainIdResolver(x.chain),
            )
            .map((x) => {
                return formatAsset(zerionChainIdResolver(x.chain)!, x)
            })

        return createPageable(
            unionWith(
                assets || [],
                getNativeAssets(),
                (a, z) => isSameAddress(a.address, z.address) && a.chainId === z.chainId,
            ),
            createIndicator(options?.indicator),
        )
    }

    async getTransactions(
        address: string,
        { indicator, size = 20 }: BaseHubOptions<ChainId> = {},
    ): Promise<Pageable<Transaction<ChainId, SchemaType>>> {
        const url = urlcat(ZERION_REST_API, '/v1/wallets/:address/transactions', {
            address,
            'page[after]': indicator?.id,
            'page[size]': size,
            'filter[trash]': 'only_non_trash',
        })
        const res = await fetchJSON<TransactionsResponse>(url)
        const transactions = compact(res.data.map((x) => formatRestTransaction(x)))
        let nextIndicator: PageIndicator | undefined = undefined
        if (res.links.next) {
            const url = new URL(res.links.next)
            const pageAfter = url ? url.searchParams.get('page[after]') : undefined
            nextIndicator = pageAfter ? createNextIndicator(indicator, pageAfter) : undefined
        }

        return createPageable(transactions, createIndicator(indicator), nextIndicator)
    }
}

export const Zerion = new ZerionAPI()
