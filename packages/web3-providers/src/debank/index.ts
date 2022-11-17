import urlcat from 'urlcat'
import { unionWith } from 'lodash-es'
import { EMPTY_LIST } from '@masknet/shared-base'
import {
    GasOptionType,
    Transaction,
    createPageable,
    HubOptions,
    createIndicator,
    Pageable,
    isSameAddress,
    toFixed,
} from '@masknet/web3-shared-base'
import { ChainId, formatGweiToWei, getDeBankConstants, SchemaType, GasOption } from '@masknet/web3-shared-evm'
import { formatAssets, formatTransactions } from './format.js'
import type { WalletTokenRecord, HistoryResponse, GasPriceDictResponse } from './type.js'
import type { FungibleTokenAPI, HistoryAPI, GasOptionAPI } from '../types/index.js'
import { getAllEVMNativeAssets } from '../helpers.js'

const DEBANK_OPEN_API = 'https://debank-proxy.r2d2.to'

/**
 * Debank's data might be outdated, like gas price for aurora which requires 1 Gwei at least
 * https://twitter.com/AlexAuroraDev/status/1490353255817302016
 * Once debank fixes it, we will remove this modifier.
 */
function gasModifier(gasDict: GasPriceDictResponse, chain: string) {
    if (chain === getDeBankConstants(ChainId.Aurora).CHAIN_ID) {
        ;(['fast', 'normal', 'slow'] as const).forEach((fieldKey) => {
            const field = gasDict.data[fieldKey]
            field.price = Math.max(field.price, formatGweiToWei(1).toNumber())
        })
    }
    return gasDict
}

export class DeBankAPI
    implements
        FungibleTokenAPI.Provider<ChainId, SchemaType>,
        HistoryAPI.Provider<ChainId, SchemaType>,
        GasOptionAPI.Provider<ChainId, GasOption>
{
    async getGasOptions(chainId: ChainId): Promise<Record<GasOptionType, GasOption>> {
        const { CHAIN_ID = '' } = getDeBankConstants(chainId)
        if (!CHAIN_ID) throw new Error('Failed to get gas price.')

        const response = await fetch(urlcat(DEBANK_OPEN_API, '/chain/gas_price_dict_v2', { chain: CHAIN_ID }))
        const result = (await response.json()) as GasPriceDictResponse
        if (result.error_code !== 0) throw new Error('Failed to get gas price.')

        const responseModified = gasModifier(result, CHAIN_ID)
        return {
            [GasOptionType.FAST]: {
                estimatedSeconds: responseModified.data.fast.estimated_seconds || 15,
                suggestedMaxFeePerGas: toFixed(responseModified.data.fast.price),
                suggestedMaxPriorityFeePerGas: '0',
            },
            [GasOptionType.NORMAL]: {
                estimatedSeconds: responseModified.data.normal.estimated_seconds || 30,
                suggestedMaxFeePerGas: toFixed(responseModified.data.normal.price),
                suggestedMaxPriorityFeePerGas: '0',
            },
            [GasOptionType.SLOW]: {
                estimatedSeconds: responseModified.data.slow.estimated_seconds || 60,
                suggestedMaxFeePerGas: toFixed(responseModified.data.slow.price),
                suggestedMaxPriorityFeePerGas: '0',
            },
        }
    }

    async getAssets(address: string, options?: HubOptions<ChainId>) {
        const response = await fetch(
            urlcat(DEBANK_OPEN_API, '/v1/user/all_token_list', {
                id: address,
                is_all: false,
            }),
        )
        const result = (await response.json()) as WalletTokenRecord[] | undefined
        return createPageable(
            unionWith(
                formatAssets(
                    (result ?? []).map((x) => ({
                        ...x,

                        // rename bsc to bnb
                        id: x.id === 'bsc' ? 'bnb' : x.id,
                        chain: x.chain === 'bsc' ? 'bnb' : x.chain,
                        // prefix ARETH
                        symbol: x.chain === 'arb' && x.symbol === 'ETH' ? 'ARETH' : x.symbol,
                        logo_url:
                            x.chain === 'arb' && x.symbol === 'ETH'
                                ? 'https://assets.debank.com/static/media/arbitrum.8e326f58.svg'
                                : x.logo_url,
                    })),
                ),
                getAllEVMNativeAssets(),
                (a, z) => isSameAddress(a.address, z.address) && a.chainId === z.chainId,
            ),
            createIndicator(options?.indicator),
        )
    }

    async getTransactions(
        address: string,
        { chainId = ChainId.Mainnet, indicator }: HubOptions<ChainId> = {},
    ): Promise<Pageable<Transaction<ChainId, SchemaType>>> {
        const { CHAIN_ID = '' } = getDeBankConstants(chainId)
        if (!CHAIN_ID) return createPageable(EMPTY_LIST, createIndicator(indicator))

        const response = await fetch(
            `${DEBANK_OPEN_API}/history/list?user_addr=${address.toLowerCase()}&chain=${CHAIN_ID}`,
        )
        const { data, error_code } = (await response.json()) as HistoryResponse
        if (error_code !== 0) throw new Error('Fail to load transactions.')

        const transactions = formatTransactions(chainId, data)
        return createPageable(transactions, createIndicator(indicator))
    }
}
