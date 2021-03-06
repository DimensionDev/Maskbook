import BigNumber from 'bignumber.js'
import type { Coin, Currency, Stat } from '../../types'
import {
    fetchTokensByKeyword,
    fetchTokenData,
    fetchPairsBulk,
    fetchPairsHistoricalBulk,
    fetchPairData,
    fetchPricesByBlocks,
    fetchEtherPricesByBlockNumbers,
    fetchEtherPriceByBlockNumber,
} from '../uniswap-v2-subgraph'
import type { Pair } from '../uniswap-v2-subgraph'
import {
    fetchBlockNumberByTimestamp,
    fetchBlockNumbersByTimestamps,
    fetchBlockNumbersObjectByTimestamps,
} from '../blocks'
import { fetchLatestBlocks } from '../uniswap-health'

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
    const utcTwoDaysBack = Date.UTC(
        currentTime.getUTCFullYear(),
        currentTime.getUTCMonth(),
        currentTime.getUTCDate() - 2,
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

    return {
        utcOneHourBack: Math.floor(utcOneHourBack / 1000),
        utcOneDayBack: Math.floor(utcOneDayBack / 1000),
        utcTwoDaysBack: Math.floor(utcTwoDaysBack / 1000),
        utcWeekBack: Math.floor(utcWeekBack / 1000),
    }
}

/**
 * For uniswap all coins should be treated as available
 * Please use getCoinInfo directly
 */
export function getAllCoins() {
    throw new Error('For uniswap all coins are available by default.')
}

export async function getAllCoinsByKeyword(keyword: string) {
    const tokens = await fetchTokensByKeyword(keyword)

    const coins = tokens.map(
        (x) =>
            ({
                ...x,
                address: x.id,
                eth_address: x.id,
            } as Coin),
    )

    if (keyword.toLowerCase() === 'eth') {
        coins.push({
            id: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            name: 'ETHer (Wrapped)',
            eth_address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            symbol: 'WETH',
            decimals: 18,
        } as Coin)
    } else if (keyword.toLowerCase() === 'nrge') {
        coins.push({
            id: '0x1416946162b1c2c871a73b07e932d2fb6c932069',
            address: '0x1416946162b1c2c871a73b07e932d2fb6c932069',
            name: 'Energi',
            eth_address: '0x1416946162b1c2c871a73b07e932d2fb6c932069',
            symbol: 'NRGT',
            decimals: 18,
        } as Coin)
    }
    return coins
}

/**
 * Get coin info by id
 * @param id the token address
 */
export async function getCoinInfo(id: string) {
    //#region get timestamps from one hour ago, ,one day ago, a week ago
    const { utcOneHourBack, utcOneDayBack, utcWeekBack } = getTimestampForChanges()
    //#endregion

    //#region get block from one hour ago, one day ago, a week ago
    const {
        [`t${utcOneHourBack}`]: oneHourBlock,
        [`t${utcOneDayBack}`]: oneDayBlock,
        [`t${utcWeekBack}`]: weekBlock,
    } = await fetchBlockNumbersObjectByTimestamps([utcOneHourBack, utcOneDayBack, utcWeekBack])
    //#region

    //#region get ether price
    const ethPrice = await fetchEtherPriceByBlockNumber()
    const {
        [`b${oneHourBlock}`]: oneHourBackEthPrice,
        [`b${oneDayBlock}`]: oneDayBackEthPrice,
        [`b${weekBlock}`]: weekBackEthPrice,
    } = await fetchEtherPricesByBlockNumbers([oneHourBlock, oneDayBlock, weekBlock])
    //#endregion

    //#region get tokenData
    const { token, allPairs } = await fetchTokenData(id)
    const { token: oneHourToken } = await fetchTokenData(id, oneHourBlock)
    const { token: oneDayToken } = await fetchTokenData(id, oneDayBlock)
    const { token: weekToken } = await fetchTokenData(id, weekBlock)
    //#engregion

    //#region calculate the trade volume and the untracked volume before day ago
    const oneDayVolumeUSD = new BigNumber(token?.tradeVolumeUSD ?? 0).minus(oneDayToken?.tradeVolumeUSD ?? 0).toNumber()

    const oneDayVolumeUT = new BigNumber(token?.untrackedVolumeUSD ?? 0)
        .minus(oneDayToken?.untrackedVolumeUSD ?? 0)
        .toNumber()
    //#endregion

    //#region calculate the current price and price percent before one hour ago, one day ago, a week ago.
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
    //#endregion

    //#region get pairs data
    const pairsData = await getBulkPairData(
        allPairs.map(({ id }) => id),
        ethPrice,
    )
    //#endregion

    return {
        token,
        marketInfo: {
            current_price: currentPrice.toNumber(),
            price_change_percentage_1h,
            price_change_percentage_24h,
            price_change_percentage_7d_in_currency,
            price_change_percentage_1h_in_currency: price_change_percentage_1h,
            price_change_percentage_24h_in_currency: price_change_percentage_24h,
            total_volume: new BigNumber(!!oneDayVolumeUSD ? oneDayVolumeUSD : oneDayVolumeUT).toNumber(),
        },
        tickersInfo: Object.entries(pairsData)
            .sort(([, a], [, z]) => {
                return z.oneDayVolumeUSD - a.oneDayVolumeUSD
            })
            .map(([pairAddress, pairData]) => {
                return {
                    logo_url:
                        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984/logo.png',
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

export async function getBulkPairData(pairList: string[], ethPrice?: number) {
    type Data = Pair | undefined
    const { utcOneDayBack } = getTimestampForChanges()
    const oneDayBlock = await fetchBlockNumberByTimestamp(utcOneDayBack)
    const current = await fetchPairsBulk(pairList)

    const oneDayResult = await fetchPairsHistoricalBulk(pairList, oneDayBlock)

    const oneDayData = oneDayResult.reduce<{
        [key: string]: Data
    }>((obj, cur) => ({ ...obj, [cur.id]: cur }), {})

    const pairsData = await Promise.all(
        current &&
            current.map(async (pair) => {
                let oneDayHistory = oneDayData[pair.id]
                if (!oneDayHistory) {
                    oneDayHistory = await fetchPairData(pair.id, oneDayBlock)
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

                if (
                    !oneDayHistory &&
                    pair &&
                    new BigNumber(pair.createdAtBlockNumber).isGreaterThan(oneDayBlock ?? 0)
                ) {
                    result.oneDayVolumeUSD = new BigNumber(pair.volumeUSD).toNumber()
                }
                if (!oneDayHistory && pair) {
                    result.oneDayVolumeUSD = new BigNumber(pair.volumeUSD).toNumber()
                }
                return result
            }),
    )

    return pairsData.reduce<{
        [key: string]: Data & {
            oneDayVolumeUSD: number
            oneDayVolumeUntracked: number
        }
    }>((obj, cur) => ({ ...obj, [cur.id]: cur }), {})
}

export async function getPriceStats(
    id: string,
    currency: Currency,
    interval: number,
    startTime: number,
    endTime: number,
) {
    const [latestBlock] = await fetchLatestBlocks()

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

    let blocks = await fetchBlockNumbersByTimestamps(timestamps)

    if (!blocks || blocks.length === 0) {
        return []
    }

    if (latestBlock) {
        blocks = blocks.filter(
            (block) => block.blockNumber && new BigNumber(block?.blockNumber).isLessThanOrEqualTo(latestBlock),
        )
    }

    const prices = await fetchPricesByBlocks(id, blocks)

    return prices.map(({ timestamp, derivedETH, ethPrice }) => {
        return [timestamp, new BigNumber(ethPrice ?? 0).multipliedBy(derivedETH ?? 0).toNumber()] as Stat
    })
}
