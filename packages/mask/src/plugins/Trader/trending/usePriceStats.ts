import { useAsyncRetry } from 'react-use'
import type { Currency } from '../types/index.js'
import type { DataProvider } from '@masknet/public-api'
import { isUndefined } from 'lodash-unified'
import { PluginTraderRPC } from '../messages.js'
import { Days } from '../SNSAdaptor/trending/PriceChartDaysControl.js'
import { useChainId } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'

interface Options {
    coinId?: string
    currency?: Currency
    days?: Days
    dataProvider?: DataProvider
}

export function usePriceStats({ coinId, currency, days = Days.MAX, dataProvider }: Options) {
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    return useAsyncRetry(async () => {
        if (isUndefined(days) || isUndefined(coinId) || isUndefined(dataProvider) || isUndefined(currency)) return []
        return PluginTraderRPC.getPriceStats(chainId, coinId, currency, days, dataProvider)
    }, [coinId, dataProvider, currency?.id, days])
}
