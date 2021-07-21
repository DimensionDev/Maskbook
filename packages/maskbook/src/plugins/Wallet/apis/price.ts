import { pollingTask } from '../../../utils'
import { currentEtherPriceSettings } from '../settings'

const ETH_PRICE_API = `https://api.coingecko.com/api/v3/simple/price?ids=${token}&vs_currencies=${currency}`
const ETH_PRICE_POLLING_DELAY = 30 /* seconds */ * 1000 /* milliseconds */

interface PriceRecord {
    [currency: string]: number
}

interface TokenRecord {
    [token: string]: PriceRecord
}

async function fetchTokenPrice(token = 'ethereum', currency = 'USD') {
    const response = await fetch(ETH_PRICE_API)
    const data = (await response.json()) as TokenRecord | null
    if (!data) return 0
    return data[token][currency] ?? 0
}

export function trackEtherPrice() {
    const { reset } = pollingTask(
        async () => {
            currentEtherPriceSettings.value = await fetchTokenPrice('ethereum', 'USD')
            return false
        },
        {
            autoStart: true,
            delay: ETH_PRICE_POLLING_DELAY,
        },
    )
    return reset
}
