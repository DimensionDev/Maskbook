import BigNumber from 'bignumber.js'
import { useAsyncRetry } from 'react-use'
import { EthereumAddress } from 'wallet.ts'
import { formatChecksumAddress } from '../../plugins/Wallet/formatter'
import { createEtherToken } from '../helpers'
import { ChainId, CurrencyType, EthereumTokenType, AssetDetailed } from '../types'
import { useAccount } from './useAccount'
import { useChainId } from './useChainState'

export namespace Debank {
    export interface BalanceRecord {
        balance: number
        chain: 'eth' | 'bsc' | string
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

async function fetcher(address: string, chainId: ChainId) {
    if (!EthereumAddress.isValid(address)) return []
    if (chainId !== ChainId.Mainnet) return []
    const response = await fetch(`https://api.debank.com/token/balance_list?user_addr=${address.toLowerCase()}`)
    const { data = [], error_code } = (await response.json()) as Debank.BalanceListResponse
    if (error_code === 0) return data
    return []
}

/**
 * Fetch tokens detailed info from debank API
 * @param address
 */
export function useAssetsDetailedDebank() {
    const account = useAccount()
    const chainId = useChainId()
    return useAsyncRetry(async () => {
        const data = await fetcher(account, chainId)
        return data.map((x) => ({
            chain: x.chain,
            token:
                x.id === 'eth'
                    ? createEtherToken(chainId)
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
            logoURL: x.logo_url,
        })) as AssetDetailed[]
    }, [account, chainId])
}
