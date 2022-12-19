import { useCallback, useState } from 'react'
import { Web3ContextProvider } from '@masknet/web3-hooks-base'
import type { TokenResult } from '@masknet/web3-shared-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { TrendingPopper } from './TrendingPopper.js'
import { TrendingView } from './TrendingView.js'

export interface TagInspectorProps {}

export function TagInspector(props: TagInspectorProps) {
    const createTrendingView = useCallback(
        (
            resultList: Array<TokenResult<ChainId, SchemaType>>,
            address?: string,
            isNFTProjectPopper?: boolean,
            reposition?: () => void,
        ) => {
            return (
                <TrendingViewWrapper
                    address={address}
                    resultList={resultList}
                    reposition={reposition}
                    isNFTProjectPopper={isNFTProjectPopper}
                />
            )
        },
        [],
    )
    return (
        <Web3ContextProvider value={{ pluginID: NetworkPluginID.PLUGIN_EVM, chainId: ChainId.Mainnet }}>
            <TrendingPopper>{createTrendingView}</TrendingPopper>
        </Web3ContextProvider>
    )
}

interface TrendingViewWrapperProps {
    resultList: Array<TokenResult<ChainId, SchemaType>>
    address?: string
    isNFTProjectPopper?: boolean
    reposition?: () => void
}

function TrendingViewWrapper({ resultList, reposition, address, isNFTProjectPopper }: TrendingViewWrapperProps) {
    const [result, setResult] = useState(resultList[0])
    return (
        <TrendingView
            setResult={setResult}
            result={result}
            resultList={resultList}
            onUpdate={reposition}
            address={address}
            isNFTProjectPopper={isNFTProjectPopper}
            isTokenTagPopper={!isNFTProjectPopper}
        />
    )
}
