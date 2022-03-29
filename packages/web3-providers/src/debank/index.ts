import type { WalletTokenRecord } from './type'
import urlcat from 'urlcat'
import { formatAssets } from './format'

const DEBANK_OPEN_API = 'https://openapi.debank.com'

export async function getAssetListFromDebank(address: string) {
    const response = await fetch(
        urlcat(DEBANK_OPEN_API, '/v1/user/token_list', {
            is_all: true,
            has_balance: true,
            id: address.toLowerCase(),
        }),
    )
    try {
        const result = ((await response.json()) ?? []) as WalletTokenRecord[]
        return formatAssets(
            result.map((x) => ({
                ...x,
                id: x.id === 'bsc' ? 'bnb' : x.id,
                chain: x.chain === 'bsc' ? 'bnb' : x.chain,
            })),
        )
    } catch {
        return []
    }
}
