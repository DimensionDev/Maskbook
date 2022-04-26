import urlcat from 'urlcat'
import {
    FungibleAsset,
    GasOptionType,
    GasOption,
    Pageable,
    Transaction,
    Web3Pagination,
    createPageable,
} from '@masknet/web3-shared-base'
import { ChainId, formatGweiToWei, getDeBankConstants, SchemaType } from '@masknet/web3-shared-evm'
import { formatAssets, formatTransactions } from './format'
import type { WalletTokenRecord, HistoryResponse, GasPriceDictResponse } from './type'
import type { FungibleTokenAPI, HistoryAPI, GasOptionAPI } from '../types'

const DEBANK_API = 'https://api.debank.com'
const DEBANK_OPEN_API = 'https://openapi.debank.com'

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
        GasOptionAPI.Provider<ChainId>
{
    async getGasOptions(chainId: ChainId): Promise<{
        estimatedBaseFee: string
        options: Record<GasOptionType, GasOption>
    }> {
        const { CHAIN_ID = '' } = getDeBankConstants(chainId)
        if (!CHAIN_ID) throw new Error('Failed to get gas price.')

        const response = await fetch(urlcat(DEBANK_API, '/chain/gas_price_dict_v2', { chain: CHAIN_ID }))
        const result = (await response.json()) as GasPriceDictResponse
        if (result.error_code !== 0) throw new Error('Failed to get gas price.')

        const responseModified = gasModifier(result, CHAIN_ID)
        return {
            estimatedBaseFee: '0',
            options: {
                [GasOptionType.FAST]: {
                    estimatedSeconds: responseModified.data.fast.estimated_seconds,
                    suggestedMaxFeePerGas: responseModified.data.fast.price.toString(),
                    suggestedMaxPriorityFeePerGas: '0',
                },
                [GasOptionType.NORMAL]: {
                    estimatedSeconds: responseModified.data.normal.estimated_seconds,
                    suggestedMaxFeePerGas: responseModified.data.normal.price.toString(),
                    suggestedMaxPriorityFeePerGas: '0',
                },
                [GasOptionType.SLOW]: {
                    estimatedSeconds: responseModified.data.slow.estimated_seconds,
                    suggestedMaxFeePerGas: responseModified.data.slow.price.toString(),
                    suggestedMaxPriorityFeePerGas: '0',
                },
            },
        }
    }

    async getAssets(
        address: string,
        pagination?: Web3Pagination<ChainId>,
    ): Promise<Pageable<FungibleAsset<ChainId, SchemaType>>> {
        const response = await fetch(
            urlcat(DEBANK_OPEN_API, '/v1/user/token_list', {
                id: address.toLowerCase(),
                is_all: true,
                has_balance: true,
            }),
        )
        const result = (await response.json()) as WalletTokenRecord[] | undefined
        try {
            return createPageable(
                formatAssets(
                    (result ?? []).map((x) => ({
                        ...x,

                        // rename bsc to bnb
                        id: x.id === 'bsc' ? 'bnb' : x.id,
                        chain: x.chain === 'bsc' ? 'bnb' : x.chain,
                    })),
                ),
            )
        } catch {
            return createPageable()
        }
    }

    async getTransactions(
        address: string,
        { chainId = ChainId.Mainnet }: Web3Pagination<ChainId> = {},
    ): Promise<Pageable<Transaction<ChainId, SchemaType>>> {
        const { CHAIN_ID = '' } = getDeBankConstants(chainId)
        if (!CHAIN_ID) return createPageable()

        const response = await fetch(`${DEBANK_API}/history/list?user_addr=${address.toLowerCase()}&chain=${CHAIN_ID}`)
        const { data, error_code } = (await response.json()) as HistoryResponse
        if (error_code !== 0) throw new Error('Fail to load transactions.')

        return createPageable(formatTransactions(chainId, data))
    }
}
