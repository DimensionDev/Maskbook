import { getTrendingConstants } from '@masknet/web3-shared'
import stringify from 'json-stable-stringify'
import { chunk, first, flatten } from 'lodash-es'
import { currentChainIdSettings } from '../../../Wallet/settings'

const TokenFields = `
  fragment TokenFields on Token {
    id
    name
    symbol
    derivedETH
    tradeVolume
    tradeVolumeUSD
    untrackedVolumeUSD
    totalLiquidity
    txCount
  }
`

const PairFields = `
  fragment PairFields on Pair {
    id
    txCount
    token0 {
      id
      symbol
      name
      totalLiquidity
      derivedETH
    }
    token1 {
      id
      symbol
      name
      totalLiquidity
      derivedETH
    }
    reserve0
    reserve1
    reserveUSD
    totalSupply
    trackedReserveETH
    reserveETH
    volumeUSD
    untrackedVolumeUSD
    token0Price
    token1Price
    createdAtTimestamp
  }
`

export type Token = {
    id: string
    name: string
    decimals: string
    symbol: string
    derivedETH: string
    tradeVolume: string
    tradeVolumeUSD: string
    untrackedVolumeUSD: string
    totalLiquidity: string
    txCount: string
}

export type Pair = {
    id: string
    token0: Token
    token1: Token
    reserve0: string
    reserve1: string
    totalSupply: string
    reserveETH: string
    reserveUSD: string
    trackedReserveETH: string
    token0Price: string
    token1Price: string
    volumeToken0: string
    volumeToken1: string
    volumeUSD: string
    untrackedVolumeUSD: string
    txCount: string
    createdAtTimestamp: string
    createdAtBlockNumber: string
    liquidityProviderCount: string
}

export type Bundle = {
    ethPrice: number
}

async function fetchFromUniswapV2Subgraph<T>(query: string) {
    const response = await fetch(getTrendingConstants(currentChainIdSettings.value).UNISWAP_V2_SUBGRAPH_URL, {
        method: 'POST',
        mode: 'cors',
        body: stringify({ query }),
    })
    const { data } = (await response.json()) as {
        data: T
    }
    return data
}

/**
 * Fetch Ether price of given block
 * @param blockNumber if don't give, will return latest price
 */
export async function fetchEtherPriceByBlockNumber(blockNumber?: string) {
    const response = await fetchFromUniswapV2Subgraph<{
        bundles: Bundle[]
    }>(`
        query bundles {
            bundles(where: { id: 1 } ${blockNumber ? `block: { number: ${blockNumber} }` : ''}) {
                ethPrice
            }
        }
    `)
    return first(response.bundles)?.ethPrice
}

/**
 * Fetch Ether price of list of blocks
 * @param blockNumbers
 */
export async function fetchEtherPricesByBlockNumbers(blockNumbers: (string | undefined)[]) {
    const queries = blockNumbers.map((x) => {
        return `
            b${x}: bundle(id: "1", ${x ? `block: { number: ${x} }` : ''}) {
                ethPrice
            }
        `
    })
    const response = await fetchFromUniswapV2Subgraph<{
        [key: string]: Bundle
    }>(`
        query bundles {
            ${queries.join('\n')}
        }
    `)

    let result: { [key: string]: number | undefined } = {}

    Object.keys(response).map((key) => {
        result[key] = response[key]?.ethPrice
    })

    return result
}

/**
 * Fetches tokens for an array of symbols (case-sensitive).
 * @param keyword
 */
export async function fetchTokensByKeyword(keyword: string) {
    // thegraph does not support case-insensitive searching
    // so cased keywords will be added too
    const listOfKeywords = [keyword, keyword.toLowerCase(), keyword.toUpperCase()]

    const response = await fetchFromUniswapV2Subgraph<{
        tokens: {
            id: string
            name: string
            symbol: string
            decimals: number
        }[]
    }>(`
        query tokens {
            tokens (where: { symbol_in: ${stringify(listOfKeywords)} }, orderBy: tradeVolume, orderDirection: desc) {
                id
                name
                symbol
                decimals
            }
        }
    `)
    return response.tokens
}

/**
 * Fetch the daily token data.
 */
export async function fetchTokenDayData(address: string, date: Date) {
    const utcTimestamp = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
    const response = await fetchFromUniswapV2Subgraph<{
        data: {
            tokenDayData: {
                id: string
                date: number
                priceUSD: string
                totalLiquidityToken: number
                totalLiquidityUSD: number
                totalLiquidityETH: number
                dailyVolumeETH: number
                dailyVolumeToken: number
                dailyVolumeUSD: number
            }[]
        }
    }>(`
        {
            tokenDayDatas(first: 1000, orderBy: date, date: ${utcTimestamp}, where: { token: ${address} }) {
                id
                date
                priceUSD
                totalLiquidityToken
                totalLiquidityUSD
                totalLiquidityETH
                dailyVolumeETH
                dailyVolumeToken
                dailyVolumeUSD
            }
        }
    `)
    return first(response.data.tokenDayData)
}

/**
 * Fetch the token data
 * @param address
 * @param blockNumber
 */
export async function fetchTokenData(address: string, blockNumber?: string) {
    const response = await fetchFromUniswapV2Subgraph<{
        tokens: Token[]
        pairs0: Pair[]
        pairs1: Pair[]
    }>(`
        ${TokenFields}
        ${PairFields}
        query tokens {
            tokens(${blockNumber ? `block : {number: ${blockNumber}}` : ``} where: {id:"${address}"}) {
                ...TokenFields
            }
            pairs0: pairs(where: {token0: "${address}"}, first: 50, orderBy: reserveUSD, orderDirection: desc) {
                ...PairFields
            }
            pairs1: pairs(where: {token1: "${address}"}, first: 50, orderBy: reserveUSD, orderDirection: desc) {
                ...PairFields
            }
        }
    `)

    return {
        token: first(response?.tokens),
        allPairs: response?.pairs0?.concat(response.pairs1),
    }
}

/**
 * fetch pairs bulk data
 * @param pairList
 */
export async function fetchPairsBulk(pairList: string[]) {
    const response = await fetchFromUniswapV2Subgraph<{
        pairs: Pair[]
    }>(
        `
           ${PairFields}
           query pairs {
                pairs(first: 500, where: { id_in: ${stringify(
                    pairList,
                )} }, orderBy: trackedReserveETH, orderDirection: desc ) {
                    ...PairFields
                }
           }
        `,
    )

    return response.pairs
}

/**
 * fetch pairs historical bulk data
 * @param pairs
 * @param blockNumber
 */
export async function fetchPairsHistoricalBulk(pairs: string[], blockNumber?: string) {
    const response = await fetchFromUniswapV2Subgraph<{
        pairs: Pair[]
    }>(`
            ${PairFields}
            query pairs {
                pairs(first: 200, where: { id_in: ${stringify(
                    pairs,
                )} }, block: { number: ${blockNumber} }, orderBy: trackedReserveETH, orderDirection: desc) {
                    ...PairFields
                }
            }
    `)

    return response.pairs
}

/**
 * fetch pair data
 * @param pairAddress
 * @param blockNumber
 */
export async function fetchPairData(pairAddress: string, blockNumber?: string) {
    const response = await fetchFromUniswapV2Subgraph<{
        pairs: Pair[]
    }>(`
         ${PairFields}
         query pairs {
            pairs(${blockNumber ? `block : {number: ${blockNumber}}` : ``} where: { id: "${pairAddress}"} ) {
                ...PairFields
            }
        }
    `)

    return first(response.pairs)
}

/**
 * fetch price info by token address, blocks
 * @param tokenAddress
 * @param blocks
 * @param skipCount
 */
export async function fetchPricesByBlocks(
    tokenAddress: string,
    blocks: { blockNumber?: string; timestamp: number }[],
    skipCount = 50,
) {
    // avoiding request entity too large
    const chunkBlocks = chunk(blocks, skipCount)

    const response = await Promise.all(
        chunkBlocks.map(async (chunk) => {
            const queries = chunk.map(
                (block) => `
                    t${block.timestamp}: token(id:"${tokenAddress}", blocks: { number: ${block.blockNumber} }) {
                        derivedETH
                    }
                `,
            )
            const blockQueries = chunk.map(
                (block) => `
                b${block.timestamp}: bundle(id: "1", block: { number: ${block.blockNumber} }) {
                    ethPrice
                }
            `,
            )

            return await fetchFromUniswapV2Subgraph<{
                [key: string]: { ethPrice?: string; derivedETH?: string }
            }>(`
                query blocks {
                    ${queries}
                    ${blockQueries}
                }
            `)
        }),
    )

    return flatten(
        response.map((result) => {
            if (result) {
                const keys = Object.keys(result).filter((key) => key.substring(0, 1) === 't')
                return keys.map((x) => {
                    const timestamp = x.split('t')[1]

                    return {
                        timestamp: Number(timestamp) * 1000,
                        derivedETH: result[x].derivedETH,
                        ethPrice: result[`b${timestamp}`]?.ethPrice,
                    }
                })
            }

            return []
        }),
    )
}
