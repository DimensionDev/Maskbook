import { useCallback } from 'react'
import { EMPTY_LIST, type SocialIdentity } from '@masknet/shared-base'
import { useDialogStacking } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { EVMWeb3ContextProvider } from '@masknet/web3-hooks-base'
import { DSearch } from '@masknet/web3-providers'
import { TrendingAPI } from '@masknet/web3-providers/types'
import { SearchResultType } from '@masknet/web3-shared-base'
import { TrendingPopper } from './TrendingPopper.js'
import { TrendingView } from './TrendingView.js'
import { TrendingViewProvider } from './context.js'
import { useQuery } from '@tanstack/react-query'

export function TagInspector() {
    const createTrendingView = useCallback(
        (
            name?: string,
            type?: TrendingAPI.TagType,
            currentResult?: Web3Helper.TokenResultAll,
            setActive?: (x: boolean) => void,
            identity?: SocialIdentity,
            address?: string,
            isCollectionProjectPopper?: boolean,
            reposition?: () => void,
        ) => {
            return (
                <TrendingViewWrapper
                    key={name}
                    address={address}
                    currentResult={currentResult}
                    identity={identity}
                    setActive={setActive}
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
        <EVMWeb3ContextProvider>
            <TrendingPopper locked={stack.length > 0}>{createTrendingView}</TrendingPopper>
        </EVMWeb3ContextProvider>
    )
}

interface TrendingViewWrapperProps {
    name?: string
    type?: TrendingAPI.TagType
    currentResult?: Web3Helper.TokenResultAll
    setActive?: (x: boolean) => void
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
    address,
    identity,
    isCollectionProjectPopper,
}: TrendingViewWrapperProps) {
    const keyword = isCollectionProjectPopper && name ? name : `${type === TrendingAPI.TagType.CASH ? '$' : '#'}${name}`
    const searchType = isCollectionProjectPopper ? SearchResultType.CollectionListByTwitterHandle : undefined
    const { data: resultList, isLoading: loadingResultList } = useQuery({
        queryKey: ['dsearch', keyword, searchType],
        queryFn: async () => {
            if (!keyword) return EMPTY_LIST
            const results = await DSearch.search<Web3Helper.TokenResultAll>(keyword, searchType)
            return results
        },
    })

    if (!resultList?.length || loadingResultList) return null

    return (
        <TrendingViewProvider
            isDSearch={false}
            isCollectionProjectPopper={!!isCollectionProjectPopper}
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
