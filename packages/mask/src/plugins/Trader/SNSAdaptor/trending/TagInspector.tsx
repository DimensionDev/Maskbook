import { EMPTY_LIST, NetworkPluginID, type SocialIdentity } from '@masknet/shared-base'
import { useDialogStacking } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { Web3ContextProvider } from '@masknet/web3-hooks-base'
import { DSearch } from '@masknet/web3-providers'
import { TrendingAPI } from '@masknet/web3-providers/types'
import { SearchResultType, SourceType } from '@masknet/web3-shared-base'
import { useCallback } from 'react'
import { useAsyncRetry } from 'react-use'
import { TrendingPopper } from './TrendingPopper.js'
import { TrendingView } from './TrendingView.js'
import { TrendingViewProvider } from './context.js'

export function TagInspector() {
    const createTrendingView = useCallback(
        (
            name?: string,
            type?: TrendingAPI.TagType,
            currentResult?: Web3Helper.TokenResultAll,
            setActive?: (x: boolean) => void,
            badgeBounding?: DOMRect,
            identity?: SocialIdentity,
            address?: string,
            isCollectionProjectPopper?: boolean,
            reposition?: () => void,
        ) => {
            return (
                <TrendingViewWrapper
                    address={address}
                    currentResult={currentResult}
                    identity={identity}
                    setActive={setActive}
                    badgeBounding={badgeBounding}
                    name={name}
                    type={type}
                    reposition={reposition}
                    isCollectionProjectPopper={isCollectionProjectPopper}
                />
            )
        },
        [],
    )
    const { stack } = useDialogStacking()
    return (
        <Web3ContextProvider value={{ pluginID: NetworkPluginID.PLUGIN_EVM }}>
            <TrendingPopper locked={stack.length > 0}>{createTrendingView}</TrendingPopper>
        </Web3ContextProvider>
    )
}

interface TrendingViewWrapperProps {
    name?: string
    type?: TrendingAPI.TagType
    currentResult?: Web3Helper.TokenResultAll
    setActive?: (x: boolean) => void
    badgeBounding?: DOMRect
    identity?: SocialIdentity
    address?: string
    isCollectionProjectPopper?: boolean
    reposition?: () => void
}

function TrendingViewWrapper({
    name,
    type,
    reposition,
    currentResult,
    setActive,
    badgeBounding,
    address,
    identity,
    isCollectionProjectPopper,
}: TrendingViewWrapperProps) {
    const { value: resultList, loading: loadingResultList } = useAsyncRetry(async () => {
        if (!name || !type) return EMPTY_LIST
        const results = await DSearch.search<Web3Helper.TokenResultAll>(
            isCollectionProjectPopper ? name : `${type === TrendingAPI.TagType.CASH ? '$' : '#'}${name}`,
            isCollectionProjectPopper ? SearchResultType.CollectionListByTwitterHandler : undefined,
        )
        return results.sort((a) => (a.source === SourceType.CoinMarketCap ? 1 : 0))
    }, [name, type, isCollectionProjectPopper])

    if (!resultList?.length || loadingResultList) return null

    return (
        <TrendingViewProvider
            isDSearch={false}
            isCollectionProjectPopper={!!isCollectionProjectPopper}
            badgeBounding={badgeBounding}
            isProfilePage={false}
            isTokenTagPopper={!isCollectionProjectPopper}
            isPreciseSearch={false}>
            <TrendingView
                currentResult={currentResult}
                resultList={resultList}
                onUpdate={reposition}
                address={address}
                identity={identity}
                setActive={setActive}
            />
        </TrendingViewProvider>
    )
}
