import stringify from 'json-stable-stringify'
import { getConstant } from '../../../../web3/helpers'
import { TRENDING_CONSTANTS } from '../../constants'
import { getChainId } from '../../../../extension/background-script/EthereumService'
import { first } from 'lodash-es'

async function fetchFromUniswapV2Subgraph<T>(query: string) {
    const response = await fetch(getConstant(TRENDING_CONSTANTS, 'UNISWAP_V2_SUBGRAPH_URL', await getChainId()), {
        method: 'POST',
        mode: 'cors',
        body: stringify({
            query,
        }),
    })
    const { data } = await response.json()
    return data as T
}

/**
 * Fetch Ether price of given block
 */
export async function fetchEtherPriceByBlockNumber(blockNumber: number) {
    const response = await fetchFromUniswapV2Subgraph<{
        ethPrice: number
    }>(`
        query bundles {
            bundles(where: { id: 1 }, block: { number: ${blockNumber} }) {
                ethPrice
            }
        }
    `)
    return response.ethPrice
}

/**
 * Fetch Ether price of list of blocks
 * @param keyword
 */
export async function fetchEtherPricesByBlockNumbers(blockNumbers: number[]) {
    const queries = blockNumbers.map((x) => {
        return `
            b${x}: bundle(id: "1", block: { number: ${x} }) {
                ethPrice
            }
        `
    })
    const response = await fetchFromUniswapV2Subgraph<{
        [key: string]: {
            ethPrice: number
        }
    }>(`
        query bundles {
            ${queries.join('\n')}
        }
    `)
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
            tokens (where: { symbol_in: ${stringify(listOfKeywords)} }) {
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
            tokenDayDatas(first: 1000, orderBy: date, date: ${utcTimestamp / 1000}, where: { token: ${address} }) {
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
 */
export async function fetchTokenData(address: string, blockNumber: number) {
    type Token = {
        id: string
        name: string
        symbol: string
        derivedETH: string
        tradeVolume: string
        tradeVolumeUSD: string
        untrackedVolumeUSD: string
        totalLiquidity: string
        txCount: number
    }
    type Pair = {
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
        txCount: number
        createdAtTimestamp: number
        createdAtBlockNumber: number
        liquidityProviderCount: number
    }
    const response = await fetchFromUniswapV2Subgraph<{
        tokens: Token[]
        pairs0: Pair[]
        pairs1: Pair[]
    }>(`
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
        fragment PairFields on Pair {
            reserve0
            reserve1
            totalSupply
            reserveETH
            reserveUSD
            trackedReserveETH
            token0Price
            token1Price
            volumeToken0
            volumeToken1
            volumeUSD
            untrackedVolumeUSD
            txCount
            createdAtTimestamp
            createdAtBlockNumber
            liquidityProviderCount
        }
        query tokens {
            tokens(${blockNumber ? `block : {number: ${blockNumber}}` : ``} where: {id:"${address}"}) {
                ...TokenFields
            }
            pairs0: pairs(where: {token0: "${address}"}, first: 20, orderBy: reserveUSD, orderDirection: desc) {
                ...PairFields
            }
            pairs1: pairs(where: {token1: "${address}"}, first: 20, orderBy: reserveUSD, orderDirection: desc) {
                ...PairFields
            }
        }
    `)
    return first(response.tokens)
}
