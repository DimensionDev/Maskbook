import { ChainId, formatBalance } from '@masknet/web3-shared'
import { API_URL } from '../constants'
import type { Pool, TokenFaucet } from '../types'

export async function fetchPools(chainId: ChainId) {
    // See https://github.com/pooltogether/pooltogether-api-monorepo for API documentation
    const url = new URL(`/pools/${chainId}.json`, API_URL)
    const response = await fetch(url.toString(), {})
    const data = (await response.json()) as Pool[] | null
    return data ?? []
}

export async function fetchPool(address?: string, subgraphUrl?: string) {
    if (!address || !subgraphUrl) return undefined

    const body = {
        query: `{
            prizePool(id: "${address.toLowerCase()}") {
                underlyingCollateralToken
                underlyingCollateralDecimals
                underlyingCollateralName
                underlyingCollateralSymbol
                prizeStrategy{
                    singleRandomWinner{
                        prizePeriodSeconds,
                        ticket{
                            id
                            decimals
                            symbol
                            totalSupply
                        }
                    }
                    multipleWinners{
                        prizePeriodSeconds,
                        numberOfWinners
                        ticket{
                            id
                            decimals
                            symbol
                            totalSupply
                        }
                    }
                }
            }
        }`,
    }
    const response = await fetch(subgraphUrl, {
        body: JSON.stringify(body),
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
    })

    const result = (await response.json())?.data
    const prizePool = result.prizePool

    const prizeStrategy = prizePool.prizeStrategy.singleRandomWinner
        ? prizePool.prizeStrategy.singleRandomWinner
        : prizePool.prizeStrategy.multipleWinners

    return {
        address: address,
        config: {
            numberOfWinners: prizeStrategy.numberOfWinners ?? '1',
            prizePeriodSeconds: prizeStrategy.prizePeriodSeconds,
        },
        prize: {},
        prizePool: {
            address: address,
        },
        tokens: {
            ticket: {
                ...prizeStrategy.ticket,
                address: prizeStrategy.ticket.id,
                totalSupplyUnformatted: prizeStrategy.ticket.totalSupply,
                totalSupply: formatBalance(prizeStrategy.ticket.totalSupply, prizeStrategy.ticket.decimals),
            },
            underlyingToken: {
                address: prizePool.underlyingCollateralToken,
                symbol: prizePool.underlyingCollateralSymbol,
                name: prizePool.underlyingCollateralName,
                decimals: prizePool.underlyingCollateralDecimals,
            },
        },
        tokenFaucets: [] as TokenFaucet[],
    } as unknown as Pool
}
