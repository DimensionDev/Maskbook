import type { HistoryResponse, GasPriceDictResponse, WalletTokenRecord } from '../types'
import urlcat from 'urlcat'
import { ChainId } from '@masknet/web3-shared-evm'

const DEBANK_API = 'https://api.debank.com'
const DEBANK_OPEN_API = 'https://openapi.debank.com'

export async function getTransactionList(address: string, chain: string) {
    const requestPath = urlcat(DEBANK_API, '/history/list', { user_addr: address.toLowerCase(), chain })
    const response = await fetch(requestPath)
    return response.json() as Promise<HistoryResponse>
}

export async function getAssetsList(address: string): Promise<WalletTokenRecord[]> {
    const requestPath = urlcat(DEBANK_OPEN_API, '/v1/user/token_list', {
        is_all: true,
        has_balance: true,
        id: address.toLowerCase(),
    })
    const response = await fetch(requestPath)
    try {
        return (await response.json()) ?? []
    } catch {
        return []
    }
}

const chainIdMap: Record<number, string> = {
    [ChainId.Mainnet]: 'eth',
    [ChainId.BSC]: 'bsc',
    [ChainId.xDai]: 'xdai',
    [ChainId.Matic]: 'matic',
    [ChainId.Arbitrum]: 'arb',
}

const getDebankChain = (chainId: number) => {
    return chainIdMap[chainId] ?? ''
}

export async function getGasPriceDict(chainId: ChainId) {
    const chain = getDebankChain(chainId)
    const response = await fetch(urlcat(DEBANK_API, '/chain/gas_price_dict_v2', { chain }))
    const result = await response.json()
    if (result.error_code === 0) {
        return result as GasPriceDictResponse
    }
    return null
}
