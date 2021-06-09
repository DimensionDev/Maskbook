import { useCallback } from 'react'
import { TrendingPopper } from '../trending/TrendingPopper'
import { DataProvider, TagType } from '../../types'
import { PopperView } from '../trending/PopperView'
import { useAvailableDataProviders } from '../../trending/useAvailableDataProviders'
import { useAvailableTraderProviders } from '../../trending/useAvailableTraderProviders'

export interface TagInspectorProps {}

export function TagInspector(props: TagInspectorProps) {
    // build availability cache in the background page
    useAvailableDataProviders(TagType.CASH, 'BTC')

    const createTrendingView = useCallback(
        (name: string, type: TagType, dataProviders: DataProvider[], reposition?: () => void) => {
            const { value: traderProviders = [] } = useAvailableTraderProviders(type, name)
            return (
                <PopperView
                    name={name}
                    tagType={type}
                    dataProviders={dataProviders}
                    tradeProviders={traderProviders}
                    onUpdate={reposition}
                />
            )
        },
        [],
    )
    return <TrendingPopper>{createTrendingView}</TrendingPopper>
}
