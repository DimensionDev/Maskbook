import { useCallback } from 'react'
import { TrendingPopper } from './trending/TrendingPopper'
import { DataProvider, TagType, TradeProvider } from '../types'
import { TrendingView } from './trending/TrendingView'
import { useAvailableDataProviders } from '../trending/useAvailableDataProviders'

export interface PageInspectorProps {}

export function PageInspector(props: PageInspectorProps) {
    // build availability cache in the background page
    useAvailableDataProviders(TagType.CASH, 'BTC')

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
