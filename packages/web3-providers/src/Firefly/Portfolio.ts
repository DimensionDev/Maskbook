import { isValidAddress as isValidAddressEVM } from '@masknet/web3-shared-evm'
import urlcat from 'urlcat'
import type { FireflyFarcasterAPI } from '@masknet/web3-providers/types'
import { fetchCachedJSON } from '../entry-helpers.js'
import { FIREFLY_BASE_URL } from './constants.js'
import { resolveFireflyResponseData } from './helpers.js'

/** `/v1/wallet/portfolio/summary` — only the total field this provider reads. */
type PortfolioSummaryResponse = FireflyFarcasterAPI.Response<{ total_assets?: { usd_value?: string } }>

/** Total portfolio USD value (tokens, predictions and perps) from the backend wallet summary. */
export async function getWalletPortfolioTotalValue(address: string) {
    const url = urlcat(FIREFLY_BASE_URL, '/v1/wallet/portfolio/summary', {
        // Lowercase EVM so checksummed variants hit the same server cache; other chains stay as-is.
        address: isValidAddressEVM(address) ? address.toLowerCase() : address,
    })
    const res = await fetchCachedJSON<PortfolioSummaryResponse>(url)
    const value = Number(resolveFireflyResponseData(res)?.total_assets?.usd_value)
    if (!Number.isFinite(value)) throw new Error('Invalid portfolio summary')
    return value
}
