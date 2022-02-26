import urlcat from 'urlcat'
import type { Pageable, Web3Plugin } from '@masknet/plugin-infra'
import { ChainId, formatGweiToWei, getDeBankConstants } from '@masknet/web3-shared-evm'
import { formatAssets, formatTransactions } from './format'
import type { WalletTokenRecord, HistoryResponse, GasPriceDictResponse } from './type'
import type { FungibleTokenAPI, GasPriceAPI, HistoryAPI } from '../types'

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

export class DeBankAPI implements FungibleTokenAPI.Provider, HistoryAPI.Provider, GasPriceAPI.Provider {
    async getGasPrice(chainId: ChainId): Promise<Web3Plugin.GasPrice> {
        const { CHAIN_ID = '' } = getDeBankConstants(chainId)
        if (!CHAIN_ID) throw new Error('Failed to get gas price.')

        const response = await fetch(urlcat(DEBANK_API, '/chain/gas_price_dict_v2', { chain: CHAIN_ID }))
        const result = (await response.json()) as GasPriceDictResponse
        if (result.error_code !== 0) throw new Error('Failed to get gas price.')

        const responseModified = gasModifier(result, CHAIN_ID)
        return {
            fast: {
                price: responseModified.data.fast.price,
                estimatedSeconds: responseModified.data.fast.estimated_seconds,
            },
            normal: {
                price: responseModified.data.normal.price,
                estimatedSeconds: responseModified.data.normal.estimated_seconds,
            },
            slow: {
                price: responseModified.data.slow.price,
                estimatedSeconds: responseModified.data.slow.estimated_seconds,
            },
        }
    }

    async getAssets(chainId: ChainId, address: string): Promise<Pageable<Web3Plugin.FungibleAsset>> {
        const response = await fetch(
            urlcat(DEBANK_OPEN_API, '/v1/user/token_list', {
                is_all: true,
                has_balance: true,
                id: address.toLowerCase(),
            }),
        )
        const result = (await response.json()) as WalletTokenRecord[] | undefined
        try {
            return {
                data: formatAssets(
                    (result ?? []).map((x) => ({
                        ...x,

                        // rename bsc to bnb
                        id: x.id === 'bsc' ? 'bnb' : x.id,
                        chain: x.chain === 'bsc' ? 'bnb' : x.chain,
                    })),
                ),
                hasNextPage: false,
            }
        } catch {
            return {
                data: [],
                hasNextPage: false,
            }
        }
    }

    async getTransactions(chainId: ChainId, address: string): Promise<Web3Plugin.Transaction[]> {
        const { CHAIN_ID = '' } = getDeBankConstants(chainId)
        if (!CHAIN_ID) return []

        const response = await fetch(`${DEBANK_API}/history/list?user_addr=${address.toLowerCase()}&chain=${CHAIN_ID}`)
        const { data, error_code } = (await response.json()) as HistoryResponse
        if (error_code !== 0) throw new Error('Fail to load transactions.')

        return formatTransactions(chainId, data)
    }
}
