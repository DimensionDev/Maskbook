import urlcat from 'urlcat'
import { fetchJSON } from '../entry-helpers.js'
import { FIREFLY_BASE_URL } from './constants.js'
import { resolveFireflyResponseData } from './helpers.js'

/** `/v1/wallet/portfolio/summary` — only the total field this provider reads. */
interface PortfolioSummaryResponse {
    code: number
    data?: { total_assets: { usd_value: string } }
    error?: string[]
}

/** Total portfolio USD value (tokens, predictions and perps) from the backend wallet summary. */
export async function getWalletPortfolioTotalValue(address: string) {
    const url = urlcat(FIREFLY_BASE_URL, '/v1/wallet/portfolio/summary', {
        // Lowercase so checksummed variants hit the same server cache.
        address: address.toLowerCase(),
    })
    const res = await fetchJSON<PortfolioSummaryResponse>(url)
    return Number(resolveFireflyResponseData(res).total_assets.usd_value)
}
