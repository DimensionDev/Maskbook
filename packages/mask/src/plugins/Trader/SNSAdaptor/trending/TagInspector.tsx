import type { DataProvider } from '@masknet/public-api'
import { TargetChainIdContext } from '@masknet/web3-hooks-evm'
import { useCallback } from 'react'
import type { TagType } from '../../types/index.js'
import { TrendingPopper } from './TrendingPopper.js'
import { TrendingView } from './TrendingView.js'

export interface TagInspectorProps {}

export function TagInspector(props: TagInspectorProps) {
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
