import { pollingTask } from '@masknet/shared'
import Services from '../../../extension/service'
import { currentEtherPriceSettings } from '../settings'

const ETH_PRICE_POLLING_DELAY = 30 /* seconds */ * 1000 /* milliseconds */

interface PriceRecord {
    [currency: string]: number
}

interface TokenRecord {
    [token: string]: PriceRecord
}

async function fetchTokenPrice(token = 'ethereum', currency = 'usd') {
    const data = (await Services.Helper.fetchJson(
        `https://api.coingecko.com/api/v3/simple/price?ids=${token}&vs_currencies=${currency}`,
    )) as TokenRecord | null
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
