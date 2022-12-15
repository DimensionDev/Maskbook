import { useCallback, useState } from 'react'
import { Web3ContextProvider } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import type { TrendingAPI } from '@masknet/web3-providers/types'
import type { NonFungibleTokenResult, FungibleTokenResult } from '@masknet/web3-shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { TrendingPopper } from './TrendingPopper.js'
import { TrendingView } from './TrendingView.js'

export interface TagInspectorProps {}

export function TagInspector(props: TagInspectorProps) {
    const createTrendingView = useCallback(
        (
            name: string,
            type: TrendingAPI.TagType,
            resultList: Array<
                | NonFungibleTokenResult<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>
                | FungibleTokenResult<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>
            >,
            reposition?: () => void,
        ) => {
            return <TrendingViewWrapper name={name} type={type} resultList={resultList} reposition={reposition} />
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
    name: string
    type: TrendingAPI.TagType
    resultList: Array<
        | NonFungibleTokenResult<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>
        | FungibleTokenResult<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>
    >
    reposition?: () => void
}

function TrendingViewWrapper({ resultList, name, type, reposition }: TrendingViewWrapperProps) {
    const [result, setResult] = useState(resultList[0])
    return (
        <TrendingView
            name={name}
            tagType={type}
            setResult={setResult}
            result={result}
            resultList={resultList}
            onUpdate={reposition}
        />
    )
}
