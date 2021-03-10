import BigNumber from 'bignumber.js'
import type { Coin, Currency } from '../../types'
import {
    fetchTokensByKeyword,
    fetchTokenData,
    fetchEtherPriceByBlockNumber,
    fetchPairsBulk,
    fetchPairsHistoricalBulk,
    fetchPairData,
} from '../uniswap-v2-subgraph'
import type { Pair } from '../uniswap-v2-subgraph'
import { fetchBlockNumberByTimestamp, fetchBlockNumbersByTimestamps } from '../blocks'
import { getPercentChange } from '../../../utils/getPercentChange'
import { getTimestampForChanges } from '../../../utils/getTimestampsForChanges'

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
    return coins
}

/**
 * Get current ether price, ether price one hour ago, one day ago, a week ago, and 24h price percentage
 */
export async function getEthPrice() {
    //#region get timestamps from one hour ago ,one day ago, a week ago
    const { utcOneHourBack, utcOneDayBack, utcWeekBack } = getTimestampForChanges()
    //#endregion

    //#region get current price and one hour ago ,one day ago, a week ago
    const oneHourBlock = await fetchBlockNumberByTimestamp(utcOneHourBack)
    const oneDayBlock = await fetchBlockNumberByTimestamp(utcOneDayBack)
    const weekBlock = await fetchBlockNumberByTimestamp(utcWeekBack)

    const result = await fetchEtherPriceByBlockNumber()
    const resultOneHour = await fetchEtherPriceByBlockNumber(oneHourBlock)
    const resultOneDay = await fetchEtherPriceByBlockNumber(oneDayBlock)
    const resultWeek = await fetchEtherPriceByBlockNumber(weekBlock)
    //#endregion

    const currentPrice = result?.ethPrice
    const oneHourBackPrice = resultOneHour?.ethPrice
    const oneDayBackPrice = resultOneDay?.ethPrice
    const weekBackPrice = resultWeek?.ethPrice

    //#calculate 24h percentage
    const priceChangeETH = getPercentChange(currentPrice, oneDayBackPrice)
    //#endregion

    return [currentPrice, oneHourBackPrice, oneDayBackPrice, weekBackPrice, priceChangeETH]
}

export async function getCoinInfo(id: string) {
    //#region get timestamps from one hour ago, ,one day ago, two days ago, a week ago
    const { utcOneHourBack, utcOneDayBack, utcTwoDaysBack, utcWeekBack } = getTimestampForChanges()
    //#endregion

    //#region get block from one day ago and two days ago
    const oneHourBlock = await fetchBlockNumberByTimestamp(utcOneHourBack)
    const oneDayBlock = await fetchBlockNumberByTimestamp(utcOneDayBack)
    const twoDayBlock = await fetchBlockNumberByTimestamp(utcTwoDaysBack)
    const weekBlock = await fetchBlockNumberByTimestamp(utcWeekBack)
    //#region

    // get eth price
    const [ethPrice, oneHourBackEthPrice, oneDayBackEthPrice, weekBackEthPrice] = await getEthPrice()

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

    const pairsData = await getBulkPairData(
        allPairs.map(({ id }) => id),
        ethPrice,
    )

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

export async function getPriceStats(id: string, currency: Currency) {
    return []
}
