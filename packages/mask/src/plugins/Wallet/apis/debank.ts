import type { HistoryResponse, GasPriceDictResponse, WalletTokenRecord } from '../types'
import urlcat from 'urlcat'
import { ChainId, formatGweiToWei, getDeBankConstants } from '@masknet/web3-shared-evm'

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
        const records = ((await response.json()) ?? []) as WalletTokenRecord[]
        return records.map((x) => ({
            ...x,
            id: x.id === 'bsc' ? 'bnb' : x.id,
            chain: x.chain === 'bsc' ? 'bnb' : x.chain,
        }))
    } catch {
        return []
    }
}

const auroraChainOnDebank = getDeBankConstants(ChainId.Aurora).CHAIN_ID
const harmonyChainOnDebank = getDeBankConstants(ChainId.Harmony).CHAIN_ID
const arbitrumChainOnDebank = getDeBankConstants(ChainId.Arbitrum).CHAIN_ID
const fieldKeys = ['fast', 'normal', 'slow'] as const
/**
 * Debank's data might be outdated, like gas price for aurora which requires 1 Gwei at least
 * https://twitter.com/AlexAuroraDev/status/1490353255817302016
 * Once debank fixes it, we will remove this modifier.
 */
function gasModifier(gasDict: GasPriceDictResponse, chain: string) {
    if ([auroraChainOnDebank, arbitrumChainOnDebank].includes(chain)) {
        fieldKeys.forEach((fieldKey) => {
            const field = gasDict.data[fieldKey]
            field.price = Math.max(field.price, formatGweiToWei(1).toNumber())
        })
    }
    return gasDict
}

export async function getGasPriceDict(chainId: ChainId) {
    const { CHAIN_ID = '' } = getDeBankConstants(chainId)
    if (!CHAIN_ID) return null
    const response = await fetch(urlcat(DEBANK_API, '/chain/gas_price_dict_v2', { chain: CHAIN_ID }))
    const result = await response.json()
    if (result.error_code === 0) {
        return gasModifier(result as GasPriceDictResponse, CHAIN_ID)
    }
    return null
}
