import { useCallback } from 'react'
import { TrendingPopper } from './TrendingPopper.js'
import { TagType } from '../../types/index.js'
import type { DataProvider } from '@masknet/public-api'
import { TrendingView } from './TrendingView.js'
import { useAvailableDataProviders } from '../../trending/useAvailableDataProviders.js'
import { TargetChainIdContext } from '@masknet/web3-hooks-evm'

export interface TagInspectorProps {}

export function TagInspector(props: TagInspectorProps) {
    // build availability cache in the background page
    useAvailableDataProviders(TagType.CASH, 'BTC')

    const createTrendingView = useCallback(
        (name: string, type: TagType, dataProviders: DataProvider[], reposition?: () => void) => {
            return <TrendingView name={name} tagType={type} dataProviders={dataProviders} onUpdate={reposition} />
        },
        [],
    )
    return (
        <TargetChainIdContext.Provider>
            <TrendingPopper>{createTrendingView}</TrendingPopper>
        </TargetChainIdContext.Provider>
    )
}
