import { useCallback, useState } from 'react'
import { Web3ContextProvider } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import type { Web3Helper } from '@masknet/web3-helpers'
import { TrendingPopper } from './TrendingPopper.js'
import { TrendingView } from './TrendingView.js'

export interface TagInspectorProps {}

export function TagInspector(props: TagInspectorProps) {
    const createTrendingView = useCallback((resultList: Web3Helper.TokenResultAll[], reposition?: () => void) => {
        return <TrendingViewWrapper resultList={resultList} reposition={reposition} />
    }, [])
    return (
        <Web3ContextProvider value={{ pluginID: NetworkPluginID.PLUGIN_EVM, chainId: ChainId.Mainnet }}>
            <TrendingPopper>{createTrendingView}</TrendingPopper>
        </Web3ContextProvider>
    )
}

interface TrendingViewWrapperProps {
    resultList: Web3Helper.TokenResultAll[]
    reposition?: () => void
}

function TrendingViewWrapper({ resultList, reposition }: TrendingViewWrapperProps) {
    const [result, setResult] = useState(resultList[0])
    return <TrendingView setResult={setResult} result={result} resultList={resultList} onUpdate={reposition} />
}
