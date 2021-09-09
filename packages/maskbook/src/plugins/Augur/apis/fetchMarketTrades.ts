import type { Trade } from '../types'

export async function fetchMarketTrades(
    address: string,
    id: string,
    url: string,
    fromTimestamp: number = 0,
): Promise<Trade[] | undefined> {
    const body = {
        query: `{
            market(id: "${address + '-' + id}") {
                trades(where:{timestamp_gte: "${fromTimestamp}"}) {
                    outcome
                    price
                    timestamp
                }
            }

        }`,
    }
    const response = await fetch(url, {
        body: JSON.stringify(body),
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
    })
    const rawTrades = (await response.json())?.data.market?.trades
    if (!rawTrades) return

    const trades = rawTrades.map((x: { outcome: string; price: string; timestamp: string }) => {
        return {
            outcome: Number.parseInt(x.outcome, 16),
            price: Number.parseFloat(x.price),
            timestamp: Number.parseInt(x.timestamp, 10),
        }
    })

    return trades
}
