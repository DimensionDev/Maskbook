import type { MarketInfo } from '../types'

export async function fetchMarketInfo(address: string, id: string, url: string): Promise<MarketInfo | undefined> {
    const body = {
        query: `{
            market(id: "${address + '-' + id}") {
                teamSportsMarket {
                    homeTeamId
                    awayTeamId
                    endTime
                    winner
                    overUnderTotal
                    marketType
                }
                mmaMarket {
                    homeFighterId
                    awayFighterId
                    awayFighterName
                    homeFighterName
                    endTime
                    winner
                    marketType
                }
                cryptoMarket{
                    endTime
                    winner
                    marketType
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
    const result = (await response.json())?.data.market
    return result
}
