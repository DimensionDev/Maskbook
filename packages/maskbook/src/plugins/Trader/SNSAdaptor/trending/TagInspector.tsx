import { useCallback } from 'react'
import { TrendingPopper } from './TrendingPopper'
import { TagType } from '../../types'
import type { DataProvider, TradeProvider } from '@masknet/public-api'
import { TraderView } from './TraderView'
import { useAvailableDataProviders } from '../../trending/useAvailableDataProviders'

export interface TagInspectorProps {}

export function TagInspector(props: TagInspectorProps) {
    // build availability cache in the background page
    useAvailableDataProviders(TagType.CASH, 'BTC')

    const createTrendingView = useCallback(
        (
            name: string,
            type: TagType,
            dataProviders: DataProvider[],
            tradeProviders: TradeProvider[],
            reposition?: () => void,
        ) => {
            return (
                <TraderView
                    name={name}
                    tagType={type}
                    dataProviders={dataProviders}
                    tradeProviders={tradeProviders}
                    onUpdate={reposition}
                />
            )
        },
        [],
    )
    return <TrendingPopper>{createTrendingView}</TrendingPopper>
}
