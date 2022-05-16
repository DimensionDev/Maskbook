import { useCallback } from 'react'
import { TrendingPopper } from './TrendingPopper'
import { TagType } from '../../types'
import type { DataProvider } from '@masknet/public-api'
import { TraderView } from './TraderView'
import { useAvailableDataProviders } from '../../trending/useAvailableDataProviders'
import { TargetChainIdContext } from '../../trader/useTargetChainIdContext'

export interface TagInspectorProps {}

export function TagInspector(props: TagInspectorProps) {
    // build availability cache in the background page
    useAvailableDataProviders(TagType.CASH, 'BTC')

    const createTrendingView = useCallback(
        (name: string, type: TagType, dataProviders: DataProvider[], reposition?: () => void) => {
            return <TraderView name={name} tagType={type} dataProviders={dataProviders} onUpdate={reposition} />
        },
        [],
    )
    return (
        <TargetChainIdContext.Provider>
            <TrendingPopper>{createTrendingView}</TrendingPopper>
        </TargetChainIdContext.Provider>
    )
}
