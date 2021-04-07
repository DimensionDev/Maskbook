import type { BalanceListResponse, HistoryResponse } from '../types'

const DEBANK_API = 'https://api.debank.com'

export async function getTransactionList(address: string) {
    const response = await fetch(`${DEBANK_API}/history/list?user_addr=${address.toLowerCase()}`)
    return (await response.json()) as HistoryResponse
}

export async function getAssetsList(address: string) {
    const response = await fetch(`${DEBANK_API}/token/balance_list?user_addr=${address.toLowerCase()}`)
    return (await response.json()) as BalanceListResponse
}
