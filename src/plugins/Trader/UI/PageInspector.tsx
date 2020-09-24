import React, { useEffect, useCallback } from 'react'
import Services from '../../../extension/service'
import { TrendingPopper } from './trending/TrendingPopper'
import { DataProvider, SwapProvider } from '../types'
import { TrendingView } from './trending/TrendingView'

export interface PageInspectorProps {}

export function PageInspector(props: PageInspectorProps) {
    useEffect(() => {
        // build availability cache in the background page
        Services.Plugin.invokePlugin('maskbook.trader', 'getAvailableDataProviders', 'BTC')
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
