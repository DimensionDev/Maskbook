import BigNumber from 'bignumber.js'
import useSWR from 'swr'
import { EthereumAddress } from 'wallet.ts'
import { formatChecksumAddress } from '../../plugins/Wallet/formatter'
import { createEetherToken } from '../helpers'
import { ChainId, CurrencyType, EthereumTokenType, TokenDetailed } from '../types'
import { useChainId } from './useChainState'

namespace Debank {
    export interface BalanceRecord {
        balance: number
        decimals: number
        display_symbol: null
        id: 'eth' | string
        is_core: boolean
        is_swap_common: boolean
        is_swap_hot: null
        is_verified: boolean
        logo_url: string
        name: string
        optimized_symbol: string
        price: number
        symbol: string
        time_at: null
    }

    export interface BalanceListResponse {
        data?: BalanceRecord[]
        error_code: number
    }
}

async function fetcher(chainId: ChainId, address: string) {
    if (chainId !== ChainId.Mainnet) return []
    if (!EthereumAddress.isValid(address)) return []
    const response = await fetch(`https://api.debank.com/token/balance_list?user_addr=${address}`)
    const { data = [], error_code } = (await response.json()) as Debank.BalanceListResponse
    if (error_code === 0) return data
    return []
}

/**
 * Fetch tokens detailed info from debank API
 * @param address
 */
export function useTokensDetailedDebank(address: string): TokenDetailed[] {
    const chainId = useChainId()
    const { data = [] } = useSWR([chainId, address], {
        fetcher,
    })
    return data.map((x) => ({
        token:
            x.id === 'eth'
                ? createEetherToken(chainId)
                : {
                      // distinguish token type
                      type: EthereumTokenType.ERC20,
                      address: formatChecksumAddress(x.id),
                      chainId: ChainId.Mainnet,
                      name: x.name,
                      symbol: x.symbol,
                      decimals: x.decimals,
                  },
        balance: new BigNumber(x.balance).toFixed(),
        price: {
            [CurrencyType.USD]: new BigNumber(x.price).toFixed(),
        },
        value: {
            [CurrencyType.USD]: new BigNumber(x.price)
                .multipliedBy(new BigNumber(x.balance).dividedBy(new BigNumber(10).pow(x.decimals)))
                .toFixed(),
        },
    }))
}
