import BigNumber from 'bignumber.js'
import type { Coin, Currency } from '../../types'
import { fetchTokensByKeyword, fetchTokenData, fetchEtherPriceByBlockNumber } from '../uniswap-v2-subgraph'
import { fetchBlockNumberByTimestamp } from '../blocks'
import { get2DayPercentChange, getPercentChange } from '../../../utils/getPercentChange'

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

export async function getEthPrice() {
    //#region get timestamps from one day ago
    const currentTime = new Date()
    const utcOneDayBack = Date.UTC(
        currentTime.getUTCFullYear(),
        currentTime.getUTCMonth(),
        currentTime.getUTCDate() - 1,
        currentTime.getUTCHours(),
        currentTime.getUTCMinutes(),
    )
    //#endregion

    //#region get current price and one day ago
    const oneDayBlock = await fetchBlockNumberByTimestamp(utcOneDayBack)
    const result = await fetchEtherPriceByBlockNumber()
    const resultOneDay = await fetchEtherPriceByBlockNumber(oneDayBlock)
    //#endregion

    const currentPrice = result?.ethPrice
    const oneDayBackPrice = resultOneDay?.ethPrice

    //#calculate percentage
    const priceChangeETH =
        currentPrice && oneDayBackPrice
            ? getPercentChange(new BigNumber(currentPrice), new BigNumber(oneDayBackPrice))
            : 0
    //#endregion

    return [currentPrice, oneDayBackPrice, priceChangeETH]
}

export async function getCoinInfo(id: string) {
    //#region get timestamps from one day ago and two days ago
    const currentTime = new Date()
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
    //#endregion

    //#region get block from one day ago and two days ago
    const oneDayBlock = await fetchBlockNumberByTimestamp(utcOneDayBack)
    const twoDayBlock = await fetchBlockNumberByTimestamp(utcTwoDaysBack)
    //#region

    const [ethPrice, ethPriceOld] = await getEthPrice()

    let data = await fetchTokenData(id)
    let oneDayData = await fetchTokenData(id, oneDayBlock)
    let twoDayData = await fetchTokenData(id, twoDayBlock)

    if (data && oneDayData && twoDayData && ethPrice && ethPriceOld) {
        const [oneDayVolumeUSD, volumeChangeUSD] = get2DayPercentChange(
            new BigNumber(data.tradeVolumeUSD),
            new BigNumber(oneDayData.tradeVolumeUSD),
            new BigNumber(twoDayData.tradeVolumeUSD),
        )

        const [oneDayVolumeUT, volumeChangeUT] = get2DayPercentChange(
            new BigNumber(data.untrackedVolumeUSD),
            new BigNumber(oneDayData.untrackedVolumeUSD),
            new BigNumber(twoDayData.untrackedVolumeUSD),
        )

        const [oneDayTxCounts, txChange] = get2DayPercentChange(
            new BigNumber(data.txCount),
            new BigNumber(oneDayData.txCount),
            new BigNumber(twoDayData.txCount),
        )

        const priceChangeUSD = getPercentChange(
            new BigNumber(data.derivedETH).multipliedBy(ethPrice),
            new BigNumber(oneDayData.derivedETH).multipliedBy(ethPriceOld),
        )

        return {
            ...data,
            priceUSD: new BigNumber(data.derivedETH).multipliedBy(ethPrice).valueOf(),
        }
    }

    return data
}

export async function getPriceStats(id: string, currency: Currency) {
    return []
}
