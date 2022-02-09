import type { BalanceListResponse, HistoryResponse, GasPriceDictResponse } from '../types'
import urlcat from 'urlcat'
import { ChainId } from '@masknet/web3-shared-evm'

const DEBANK_API = 'https://api.debank.com'

export async function getTransactionList(address: string, chain: string): Promise<HistoryResponse> {
    const response = await fetch(urlcat(DEBANK_API, '/history/list', { user_addr: address.toLowerCase(), chain }))
    return response.json()
}

export async function getAssetsList(address: string): Promise<BalanceListResponse> {
    const response = await fetch(DEBANK_API, '/token/balance_list', { is_all: true, user_addr: address.toLowerCase() })
    return response.json()
}

const chainIdMap: Record<ChainId, string> = {
    [ChainId.Mainnet]: 'eth',
    [ChainId.BSC]: 'bsc',
    [ChainId.xDai]: 'xdai',
    [ChainId.Matic]: 'matic',
    [ChainId.Arbitrum]: 'arb',
    [ChainId.Boba]: 'boba',
}

const getDebankChain = (chainId: ChainId) => {
    return chainIdMap[chainId] ?? ''
}

export async function getGasPriceDict(chainId: ChainId) {
    const chain = getDebankChain(chainId)
    const response = await fetch(urlcat(DEBANK_API, '/chain/gas_price_dict_v2', { chain }))
    const result: GasPriceDictResponse = await response.json()
    if (result.error_code === 0) {
        return result
    }
}
