import BigNumber from 'bignumber.js'
import type { Pair } from './uniswap-v2-subgraph'
import {
    fetchEtherPriceByBlockNumber,
    fetchEtherPricesByBlockNumbers,
    fetchPairData,
    fetchPairsBulk,
    fetchPairsHistoricalBulk,
    fetchPricesByBlocks,
    fetchTokenData,
    fetchTokensByKeyword,
} from './uniswap-v2-subgraph'
import {
    fetchBlockNumberByTimestamp,
    fetchBlockNumbersByTimestamps,
    fetchBlockNumbersObjectByTimestamps,
} from './blocks'
import { fetchLatestBlocks } from './uniswap-health'
import { isGreaterThan, isLessThanOrEqualTo, TokenType } from '@masknet/web3-shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import type { TrendingAPI } from '../types'

type Value = string | number | BigNumber | undefined

/**
 * get standard percent change between two values
 * @param valueNow
 * @param value24HoursAgo
 */
export const getPercentChange = (valueNow: Value, value24HoursAgo: Value) => {
    const adjustedPercentChange = new BigNumber(valueNow ?? 0)
        .minus(value24HoursAgo ?? 0)
        .dividedBy(value24HoursAgo ?? 0)
        .multipliedBy(100)
    if (adjustedPercentChange.isNaN() || !adjustedPercentChange.isFinite()) {
        return 0
    }
    return adjustedPercentChange.toNumber()
}

/**
 * Get timestamp from current, one hour ago, one day ago, a week ago
 */
function getTimestampForChanges() {
    const currentTime = new Date()

    const utcOneHourBack = Date.UTC(
        currentTime.getUTCFullYear(),
        currentTime.getUTCMonth(),
        currentTime.getUTCDate(),
        currentTime.getUTCHours() - 1,
        currentTime.getUTCMinutes(),
    )
    const utcOneDayBack = Date.UTC(
        currentTime.getUTCFullYear(),
        currentTime.getUTCMonth(),
        currentTime.getUTCDate() - 1,
        currentTime.getUTCHours(),
        currentTime.getUTCMinutes(),
    )
    const utcWeekBack = Date.UTC(
        currentTime.getUTCFullYear(),
        currentTime.getUTCMonth(),
        currentTime.getUTCDate() - 7,
        currentTime.getUTCHours(),
        currentTime.getUTCMinutes(),
    )

    const utcTwoWeekBack = Date.UTC(
        currentTime.getUTCFullYear(),
        currentTime.getUTCMonth(),
        currentTime.getUTCDate() - 14,
        currentTime.getUTCHours(),
        currentTime.getUTCMinutes(),
    )

    const utcOneMonthBack = Date.UTC(
        currentTime.getUTCFullYear(),
        currentTime.getUTCMonth() - 1,
        currentTime.getUTCDate(),
        currentTime.getUTCHours(),
        currentTime.getUTCMinutes(),
    )

    const utcOneYearBack = Date.UTC(
        currentTime.getUTCFullYear() - 1,
        currentTime.getUTCMonth(),
        currentTime.getUTCDate(),
        currentTime.getUTCHours(),
        currentTime.getUTCMinutes(),
    )

    return {
        utcOneHourBack: Math.floor(utcOneHourBack / 1000),
        utcOneDayBack: Math.floor(utcOneDayBack / 1000),
        utcWeekBack: Math.floor(utcWeekBack / 1000),
        utcTwoWeekBack: Math.floor(utcTwoWeekBack / 1000),
        utcOneMonthBack: Math.floor(utcOneMonthBack / 1000),
        utcOneYearBack: Math.floor(utcOneYearBack / 1000),
    }
}

/**
 * For uniswap all coins should be treated as available
 * Please use getCoinInfo directly
 */
export function getAllCoins() {
    throw new Error('For uniswap all coins are available by default.')
}

export async function getAllCoinsByKeyword(chainId: ChainId, keyword: string): Promise<TrendingAPI.Coin[]> {
    keyword = keyword.toLowerCase()
    if (keyword === 'mask') {
        return [
            {
                decimals: 18,
                address: '0x69af81e73a73b40adf4f3d4223cd9b1ece623074',
                id: '0x69af81e73a73b40adf4f3d4223cd9b1ece623074',
                name: 'Mask Network',
                symbol: 'MASK',
                type: TokenType.Fungible,
                contract_address: '0x69af81e73a73b40adf4f3d4223cd9b1ece623074',
            },
        ]
    }

    const tokens = await fetchTokensByKeyword(chainId, keyword)

    const coins: TrendingAPI.Coin[] = tokens.map((x) => ({
        ...x,
        type: TokenType.Fungible,
        address: x.id,
        contract_address: x.id,
    }))

    if (keyword === 'eth') {
        coins.unshift({
            id: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            name: 'ETHer (Wrapped)',
            contract_address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            symbol: 'eth',
            type: TokenType.Fungible,
            decimals: 18,
        })
    } else if (keyword === 'nrge') {
        coins.unshift({
            id: '0x1416946162b1c2c871a73b07e932d2fb6c932069',
            address: '0x1416946162b1c2c871a73b07e932d2fb6c932069',
            name: 'Energi',
            contract_address: '0x1416946162b1c2c871a73b07e932d2fb6c932069',
            symbol: 'NRGT',
            type: TokenType.Fungible,
            decimals: 18,
        })
    }
    return coins
}

/**
 * Get coin info by id
 * @param chainId ChainId
 * @param id the token address
 */
export async function getCoinInfo(chainId: ChainId, id: string) {
    // #region get timestamps from one hour ago, ,one day ago, a week ago
    const { utcOneHourBack, utcOneDayBack, utcWeekBack, utcTwoWeekBack, utcOneMonthBack, utcOneYearBack } =
        getTimestampForChanges()
    // #endregion

    // #region get block from one hour ago, one day ago, a week ago
    const {
        [`t${utcOneHourBack}`]: oneHourBlock,
        [`t${utcOneDayBack}`]: oneDayBlock,
        [`t${utcWeekBack}`]: weekBlock,
        [`t${utcTwoWeekBack}`]: twoWeekBlock,
        [`t${utcOneMonthBack}`]: oneMonthBlock,
        [`t${utcOneYearBack}`]: oneYearBlock,
    } = await fetchBlockNumbersObjectByTimestamps(chainId, [
        utcOneHourBack,
        utcOneDayBack,
        utcWeekBack,
        utcTwoWeekBack,
        utcOneMonthBack,
        utcOneYearBack,
    ])
    // #region

    // #region get ether price
    const ethPrice = await fetchEtherPriceByBlockNumber(chainId)
    const {
        [`b${oneHourBlock}`]: oneHourBackEthPrice,
        [`b${oneDayBlock}`]: oneDayBackEthPrice,
        [`b${weekBlock}`]: weekBackEthPrice,
        [`b${twoWeekBlock}`]: twoWeekBackEthPrice,
        [`b${oneMonthBlock}`]: oneMonthBackEthPrice,
        [`b${oneYearBlock}`]: oneYearBackEthPrice,
    } = await fetchEtherPricesByBlockNumbers(chainId, [
        oneHourBlock,
        oneDayBlock,
        weekBlock,
        twoWeekBlock,
        oneMonthBlock,
        oneYearBlock,
    ])
    // #endregion

    // #region get tokenData
    const [
        { token, allPairs },
        { token: oneHourToken },
        { token: oneDayToken },
        { token: weekToken },
        { token: twoWeekToken },
        { token: oneMonthToken },
        { token: oneYearToken },
    ] = await Promise.all([
        fetchTokenData(chainId, id),
        fetchTokenData(chainId, id, oneHourBlock),
        fetchTokenData(chainId, id, oneDayBlock),
        fetchTokenData(chainId, id, weekBlock),
        fetchTokenData(chainId, id, twoWeekBlock),
        fetchTokenData(chainId, id, oneMonthBlock),
        fetchTokenData(chainId, id, oneYearBlock),
    ])
    // #endregion

    // #region calculate the trade volume and the untracked volume before day ago
    const oneDayVolumeUSD = new BigNumber(token?.tradeVolumeUSD ?? 0).minus(oneDayToken?.tradeVolumeUSD ?? 0).toNumber()

    const oneDayVolumeUT = new BigNumber(token?.untrackedVolumeUSD ?? 0)
        .minus(oneDayToken?.untrackedVolumeUSD ?? 0)
        .toNumber()
    // #endregion

    // #region calculate the current price and price percent before one hour ago, one day ago, a week ago.
    const currentPrice = new BigNumber(token?.derivedETH ?? 0).multipliedBy(ethPrice ?? 0)

    const price_change_percentage_1h = getPercentChange(
        currentPrice,
        new BigNumber(oneHourToken?.derivedETH ?? 0).multipliedBy(oneHourBackEthPrice ?? 0),
    )

    const price_change_percentage_24h = getPercentChange(
        currentPrice,
        new BigNumber(oneDayToken?.derivedETH ?? 0).multipliedBy(oneDayBackEthPrice ?? 0),
    )

    const price_change_percentage_7d_in_currency = getPercentChange(
        currentPrice,
        new BigNumber(weekToken?.derivedETH ?? 0).multipliedBy(weekBackEthPrice ?? 0),
    )

    const price_change_percentage_14d_in_currency = getPercentChange(
        currentPrice,
        new BigNumber(twoWeekToken?.derivedETH ?? 0).multipliedBy(twoWeekBackEthPrice ?? 0),
    )

    const price_change_percentage_30d_in_currency = getPercentChange(
        currentPrice,
        new BigNumber(oneMonthToken?.derivedETH ?? 0).multipliedBy(oneMonthBackEthPrice ?? 0),
    )

    const price_change_percentage_1y_in_currency = getPercentChange(
        currentPrice,
        new BigNumber(oneYearToken?.derivedETH ?? 0).multipliedBy(oneYearBackEthPrice ?? 0),
    )
    // #endregion

    // #region get pairs data
    const pairsData = await getBulkPairData(
        chainId,
        allPairs?.map(({ id }) => id),
    )
    // #endregion

    return {
        token,
        marketInfo: {
            current_price: currentPrice.toNumber(),
            price_change_percentage_1h,
            price_change_percentage_24h,
            price_change_percentage_7d_in_currency,
            price_change_percentage_14d_in_currency,
            price_change_percentage_30d_in_currency,
            price_change_percentage_1y_in_currency,
            price_change_percentage_1h_in_currency: price_change_percentage_1h,
            price_change_percentage_24h_in_currency: price_change_percentage_24h,
            total_volume: new BigNumber(oneDayVolumeUSD ? oneDayVolumeUSD : oneDayVolumeUT).toNumber(),
        },
        tickersInfo: Object.entries(pairsData)
            .sort(([, a], [, z]) => {
                return z.oneDayVolumeUSD - a.oneDayVolumeUSD
            })
            .map(([pairAddress, pairData]) => {
                return {
                    logo_url:
                        'https://raw.githubusercontent.com/dimensiondev/assets/master/blockchains/ethereum/assets/0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984/logo.png',
                    trade_url: `https://info.uniswap.org/pair/${pairAddress}`,
                    market_name: 'Uniswap (V2)',
                    base_name: pairData.token0.symbol,
                    target_name: pairData.token1.symbol,
                    volume:
                        pairData.oneDayVolumeUSD === 0 && pairData.oneDayVolumeUntracked
                            ? pairData.oneDayVolumeUntracked
                            : pairData.oneDayVolumeUSD,
                    updated: new Date(),
                }
            })
            .slice(0, 30),
    }
}

export async function getBulkPairData(chainId: ChainId, pairList: string[]) {
    type Data = Pair | undefined
    const { utcOneDayBack } = getTimestampForChanges()
    const oneDayBlock = await fetchBlockNumberByTimestamp(chainId, utcOneDayBack)
    const current = await fetchPairsBulk(chainId, pairList)

    const oneDayResult = await fetchPairsHistoricalBulk(chainId, pairList, oneDayBlock)

    const oneDayData = Object.fromEntries(oneDayResult.map((pair): [string, Data] => [pair.id, pair]))

    const pairsData = await Promise.all(
        current?.map(async (pair) => {
            let oneDayHistory = oneDayData[pair.id]
            if (!oneDayHistory) {
                oneDayHistory = await fetchPairData(chainId, pair.id, oneDayBlock)
            }

            const oneDayVolumeUSD = new BigNumber(pair.volumeUSD).minus(oneDayHistory?.volumeUSD ?? 0).toNumber()
            const oneDayVolumeUntracked = new BigNumber(pair.untrackedVolumeUSD)
                .minus(oneDayHistory?.untrackedVolumeUSD ?? 0)
                .toNumber()

            const result = {
                ...pair,
                oneDayVolumeUSD,
                oneDayVolumeUntracked,
            }

            if (!oneDayHistory && pair && isGreaterThan(pair.createdAtBlockNumber, oneDayBlock ?? 0)) {
                result.oneDayVolumeUSD = new BigNumber(pair.volumeUSD).toNumber()
            }
            if (!oneDayHistory && pair) {
                result.oneDayVolumeUSD = new BigNumber(pair.volumeUSD).toNumber()
            }
            return result
        }),
    )

    return Object.fromEntries(
        pairsData.map((pair): [string, Data & { oneDayVolumeUSD: number; oneDayVolumeUntracked: number }] => [
            pair.id,
            pair,
        ]),
    )
}

// the bitcoin ledger started at 03 Jan 2009
export const BTC_FIRST_LEGER_DATE = new Date('2009-01-03T00:00:00.000Z')

export async function getPriceStats(
    chainId: ChainId,
    id: string,
    interval: number,
    startTime: number,
    endTime: number,
) {
    const [latestBlock] = await fetchLatestBlocks(chainId)

    // create an array of hour start times until we reach current hour
    // buffer by half your to catch case where graph isn't to latest block
    const timestamps = []
    let time = startTime
    while (time < endTime) {
        timestamps.push(time)
        time += interval
    }

    if (timestamps.length === 0) {
        return []
    }

    let blocks = await fetchBlockNumbersByTimestamps(chainId, timestamps)

    if (!blocks || blocks.length === 0) {
        return []
    }

    if (latestBlock) {
        blocks = blocks.filter((block) => block.blockNumber && isLessThanOrEqualTo(block?.blockNumber, latestBlock))
    }

    const prices = await fetchPricesByBlocks(chainId, id, blocks)

    return prices.map(({ timestamp, derivedETH, ethPrice }) => {
        return [timestamp, new BigNumber(ethPrice ?? 0).multipliedBy(derivedETH ?? 0).toNumber()] as TrendingAPI.Stat
    })
}
