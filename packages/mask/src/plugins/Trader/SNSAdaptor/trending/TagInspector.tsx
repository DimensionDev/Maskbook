import { useCallback } from 'react'
import { TrendingPopper } from './TrendingPopper.js'
import { TagType } from '../../types/index.js'
import type { DataProvider } from '@masknet/public-api'
import { TrendingView } from './TrendingView.js'
import { useAvailableDataProviders } from '../../trending/useAvailableDataProviders.js'
import { ChainContextProvider } from '@masknet/web3-hooks-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { NetworkPluginID } from '@masknet/shared-base'

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
        <ChainContextProvider value={{ chainId: ChainId.Mainnet, pluginID: NetworkPluginID.PLUGIN_EVM }}>
            <TrendingPopper>{createTrendingView}</TrendingPopper>
        </ChainContextProvider>
    )
}
