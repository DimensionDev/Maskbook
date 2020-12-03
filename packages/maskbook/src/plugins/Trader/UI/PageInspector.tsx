import { useCallback } from 'react'
import { useEffectOnce } from 'react-use'
import { TrendingPopper } from './trending/TrendingPopper'
import { DataProvider, TradeProvider } from '../types'
import { TrendingView } from './trending/TrendingView'
import { PluginTraderRPC } from '../messages'

export interface PageInspectorProps {}

export function PageInspector(props: PageInspectorProps) {
    useEffectOnce(() => {
        // build availability cache in the background page
        PluginTraderRPC.getAvailableDataProviders('BTC')
    })
    const createTrendingView = useCallback((name: string, dataProviders: DataProvider[], reposition?: () => void) => {
        return (
            <TrendingView
                name={name}
                dataProviders={dataProviders}
                tradeProviders={[TradeProvider.UNISWAP, TradeProvider.ZRX]}
                onUpdate={reposition}
            />
        )
    }, [])
    return <TrendingPopper>{createTrendingView}</TrendingPopper>
}
