import { useCallback } from 'react'
import { useAsyncRetry } from 'react-use'
import { Web3ContextProvider } from '@masknet/web3-hooks-base'
import { SearchResultType } from '@masknet/web3-shared-base'
import { EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { DSearch } from '@masknet/web3-providers'
import { TrendingAPI } from '@masknet/web3-providers/types'
import type { Web3Helper } from '@masknet/web3-helpers'
import { TrendingPopper } from './TrendingPopper.js'
import { TrendingView } from './TrendingView.js'
import { TrendingViewProvider } from './context.js'

export interface TagInspectorProps {}

export function TagInspector(props: TagInspectorProps) {
    const createTrendingView = useCallback(
        (
            name?: string,
            type?: TrendingAPI.TagType,
            address?: string,
            isNFTProjectPopper?: boolean,
            reposition?: () => void,
        ) => {
            return (
                <TrendingViewWrapper
                    address={address}
                    name={name}
                    type={type}
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
    name?: string
    type?: TrendingAPI.TagType
    address?: string
    isNFTProjectPopper?: boolean
    reposition?: () => void
}

function TrendingViewWrapper({ name, type, reposition, address, isNFTProjectPopper }: TrendingViewWrapperProps) {
    const { value: resultList } = useAsyncRetry(async () => {
        if (!name || !type) return EMPTY_LIST
        return DSearch.search<Web3Helper.TokenResultAll>(
            isNFTProjectPopper ? name : `${type === TrendingAPI.TagType.CASH ? '$' : '#'}${name}`,
            isNFTProjectPopper ? SearchResultType.NonFungibleCollection : undefined,
        )
    }, [name, type, isNFTProjectPopper])

    if (!resultList?.length) return null

    return (
        <TrendingViewProvider
            isNFTProjectPopper={Boolean(isNFTProjectPopper)}
            isProfilePage={false}
            isTokenTagPopper={!isNFTProjectPopper}
            isPreciseSearch={false}>
            <TrendingView resultList={resultList} onUpdate={reposition} address={address} />
        </TrendingViewProvider>
    )
}
