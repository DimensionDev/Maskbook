import type { BalanceListResponse, HistoryResponse, GasPriceDictResponse } from '../types'
import urlcat from 'urlcat'

const DEBANK_API = 'https://api.debank.com'

export async function getTransactionList(address: string, chain: string) {
    const response = await fetch(`${DEBANK_API}/history/list?user_addr=${address.toLowerCase()}&chain=${chain}`)
    return (await response.json()) as HistoryResponse
}

export async function getAssetsList(address: string) {
    const response = await fetch(`${DEBANK_API}/token/balance_list?is_all=true&user_addr=${address.toLowerCase()}`)
    return (await response.json()) as BalanceListResponse
}

export async function getGasPriceDict(chain: string) {
    const response = await fetch(urlcat(DEBANK_API, '/chain/gas_price_dict_v2', { chain }))
    return (await response.json()) as GasPriceDictResponse
}
