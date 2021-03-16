import { PluginTraderRPC } from '../messages'
import { useEffect, useState } from 'react'
import { DataProvider } from '../types'
import { useValueRef } from '../../../utils/hooks/useValueRef'
import { subscribeCoins } from '../settings'

const loop = () => {}

export function useCoinLatestPriceInfo(coinId: string | undefined, dataProvider?: DataProvider) {
    const [latestPriceInfo, setLatestPriceInfo] = useState<{
        latestPrice: number | null
        latestPrice_1h_percentage: number | null
    }>({
        latestPrice: null,
        latestPrice_1h_percentage: null,
    })

    const coins = useValueRef(subscribeCoins)

    useEffect(() => {
        if (coinId && dataProvider === DataProvider.COIN_MARKET_CAP) {
            PluginTraderRPC.subscribeLatestPrice(coinId)

            return () => {
                PluginTraderRPC.unSubscribeLatestPrice(coinId)
            }
        }
        return loop
    }, [coinId, dataProvider])

    useEffect(() => {
        if (coins && coinId && dataProvider === DataProvider.COIN_MARKET_CAP) {
            try {
                const parsed = JSON.parse(coins)
                setLatestPriceInfo({
                    latestPrice: parsed[coinId]?.p ?? null,
                    latestPrice_1h_percentage: parsed[coinId]?.p1h ?? null,
                })
            } catch (e) {
                setLatestPriceInfo({
                    latestPrice: null,
                    latestPrice_1h_percentage: null,
                })
            }
        }
    }, [coins, coinId, dataProvider])

    return latestPriceInfo
}
