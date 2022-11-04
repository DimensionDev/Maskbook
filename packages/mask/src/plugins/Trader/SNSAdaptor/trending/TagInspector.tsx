import { useCallback } from 'react'
import type { DataProvider } from '@masknet/public-api'
import { Web3ContextProvider } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
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
        <Web3ContextProvider value={{ pluginID: NetworkPluginID.PLUGIN_EVM, chainId: ChainId.Mainnet }}>
            <TrendingPopper>{createTrendingView}</TrendingPopper>
        </Web3ContextProvider>
    )
}
