import { useEffect, useCallback } from 'react'
import { TrendingPopper } from './trending/TrendingPopper'
import { DataProvider, SwapProvider } from '../types'
import { TrendingView } from './trending/TrendingView'
import { PluginTraderRPC } from '../messages'

export interface PageInspectorProps {}

export function PageInspector(props: PageInspectorProps) {
    useEffect(() => {
        // build availability cache in the background page
        PluginTraderRPC.getAvailableDataProviders('BTC')
    }, [])
    const createTrendingView = useCallback((name: string, dataProviders: DataProvider[], reposition?: () => void) => {
        return (
            <TrendingView
                name={name}
                dataProviders={dataProviders}
                swapProviders={[SwapProvider.UNISWAP]}
                onUpdate={reposition}
            />
        )
    }, [])
    return <TrendingPopper>{createTrendingView}</TrendingPopper>
}
