import type { HistoryResponse, GasPriceDictResponse, WalletTokenRecord } from '../types'
import urlcat from 'urlcat'
import { ChainId, getDeBankConstants } from '@masknet/web3-shared-evm'

const DEBANK_API = 'https://api.debank.com'
const DEBANK_OPEN_API = 'https://openapi.debank.com'

export async function getTransactionList(address: string, chainId: ChainId) {
    const { CHAIN_ID = '' } = getDeBankConstants(chainId)
    if (!CHAIN_ID) return null
    const response = await fetch(`${DEBANK_API}/history/list?user_addr=${address.toLowerCase()}&chain=${CHAIN_ID}`)
    return (await response.json()) as HistoryResponse
}

export async function getAssetsList(address: string) {
    const response = await fetch(
        `${DEBANK_OPEN_API}/v1/user/token_list?is_all=true&has_balance=true&id=${address.toLowerCase()}`,
    )
    try {
        return ((await response.json()) ?? []) as WalletTokenRecord[]
    } catch {
        return []
    }
}

export async function getGasPriceDict(chainId: ChainId) {
    const { CHAIN_ID = '' } = getDeBankConstants(chainId)
    if (!CHAIN_ID) return null
    const response = await fetch(urlcat(DEBANK_API, '/chain/gas_price_dict_v2', { chain: CHAIN_ID }))
    const result = await response.json()
    if (result.error_code === 0) {
        return result as GasPriceDictResponse
    }
    return null
}
