import { pollingTask } from '@masknet/shared'
import { currentEtherPriceSettings } from '../settings'

const ETH_PRICE_POLLING_DELAY = 30 /* seconds */ * 1000 /* milliseconds */

// eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
interface PriceRecord {
    [currency: string]: number
}

// eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
interface TokenRecord {
    [token: string]: PriceRecord
}

async function fetchTokenPrice(token = 'ethereum', currency = 'usd') {
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${token}&vs_currencies=${currency}`)
    const data = (await response.json()) as TokenRecord | null
    if (!data) return 0
    return data[token][currency] ?? 0
}

export function trackEtherPrice() {
    const { reset } = pollingTask(
        async () => {
            currentEtherPriceSettings.value = await fetchTokenPrice('ethereum', 'usd')
            return false
        },
        {
            autoStart: true,
            delay: ETH_PRICE_POLLING_DELAY,
        },
    )
    return reset
}
