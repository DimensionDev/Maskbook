import { ZERO } from '@masknet/web3-shared-evm'
import type BigNumber from 'bignumber.js'
import { MARKET_ID_REGEX, MIN_LP_COLLATERAL } from '../constants'
import type { RawUserMarket, UserMarket } from '../types'

export async function fetchUserPositions(userAddress: string, url: string): Promise<UserMarket[] | undefined> {
    const body = {
        query: `{
            markets(first:1000) {
              id
              liquidity(where:{recipient: "${userAddress}"}) {
                collateral
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
    const rawMarkets = (await response.json())?.data.markets
    if (!rawMarkets || rawMarkets.length === 0) return

    const markets = rawMarkets
        .filter((m: RawUserMarket) => !!m.liquidity && m.liquidity.length !== 0)
        .map((m: RawUserMarket): UserMarket => {
            const [, address, id] = m.id ? m.id.match(MARKET_ID_REGEX) ?? [] : []
            return {
                id: id,
                address: address,
                liquidity: {
                    collateral: m.liquidity.reduce(
                        // Negative collateral means increased liquidity and visa versa
                        (accumulator: BigNumber, currentValue): BigNumber => accumulator.minus(currentValue.collateral),
                        ZERO,
                    ),
                },
            }
        })
        .filter((m: UserMarket) => m.liquidity.collateral.isGreaterThan(MIN_LP_COLLATERAL))

    return markets
}
