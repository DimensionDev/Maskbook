import BigNumber from 'bignumber.js'
import type { AmmExchange } from '../types'

export async function fetchAmmExchange(address: string, id: string, url: string) {
    const body = {
        query: `{
            market(id: "${address + '-' + id}") {
                liquidity {
                    collateral
                }
                trades {
                    outcome
                    collateral
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
    const rawAmmExchange = (await response.json())?.data.market
    if (!rawAmmExchange) return

    const ammExchange = {
        liquidity: rawAmmExchange.liquidity.map((x: { collateral: string }) => {
            return { collateral: new BigNumber(x.collateral).negated() }
        }),
        trades: rawAmmExchange.trades.map((x: { outcome: string; collateral: string; timestamp: string }) => {
            return {
                outcome: Number.parseInt(x.outcome, 16),
                collateral: new BigNumber(x.collateral).negated(),
                timestamp: Number.parseInt(x.timestamp, 10),
            }
        }),
        totalLiquidity: new BigNumber(0),
        totalVolume: new BigNumber(0),
        volume24hr: new BigNumber(0),
    } as AmmExchange

    ammExchange.totalLiquidity = ammExchange.liquidity.reduce(
        (accumulator, currentValue): BigNumber => accumulator.plus(currentValue.collateral),
        new BigNumber(0),
    )

    ammExchange.totalVolume = ammExchange.trades.reduce(
        (accumulator, currentValue): BigNumber => accumulator.plus(currentValue.collateral?.abs() ?? 0),
        new BigNumber(0),
    )
    const now = new Date()
    const timestamps24hrAgo = +now.setDate(now.getDate() - 1) / 1000
    ammExchange.volume24hr = ammExchange.trades
        .filter((x) => x.timestamp > timestamps24hrAgo)
        .reduce(
            (accumulator, currentValue): BigNumber => accumulator.plus(currentValue.collateral?.abs() ?? 0),
            new BigNumber(0),
        )

    return ammExchange
}
