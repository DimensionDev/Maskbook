import { useCallback } from 'react'
import { useAsyncRetry } from 'react-use'
import { Web3ContextProvider } from '@masknet/web3-hooks-base'
import { SearchResultType, SocialIdentity } from '@masknet/web3-shared-base'
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
            identity?: SocialIdentity,
            address?: string,
            isCollectionProjectPopper?: boolean,
            reposition?: () => void,
        ) => {
            return (
                <TrendingViewWrapper
                    address={address}
                    identity={identity}
                    name={name}
                    type={type}
                    reposition={reposition}
                    isCollectionProjectPopper={isCollectionProjectPopper}
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
    identity?: SocialIdentity
    address?: string
    isCollectionProjectPopper?: boolean
    reposition?: () => void
}

function TrendingViewWrapper({
    name,
    type,
    reposition,
    address,
    identity,
    isCollectionProjectPopper,
}: TrendingViewWrapperProps) {
    const { value: resultList, loading: loadingResultList } = useAsyncRetry(async () => {
        if (!name || !type) return EMPTY_LIST
        return DSearch.search<Web3Helper.TokenResultAll>(
            isCollectionProjectPopper ? name : `${type === TrendingAPI.TagType.CASH ? '$' : '#'}${name}`,
            isCollectionProjectPopper ? SearchResultType.CollectionListByTwitterHandler : undefined,
        )
    }, [name, type, isCollectionProjectPopper])

    if (!resultList?.length || loadingResultList) return null

    return (
        <TrendingViewProvider
            isCollectionProjectPopper={Boolean(isCollectionProjectPopper)}
            isProfilePage={false}
            isTokenTagPopper={!isCollectionProjectPopper}
            isPreciseSearch={false}>
            <TrendingView resultList={resultList} onUpdate={reposition} address={address} identity={identity} />
        </TrendingViewProvider>
    )
}
