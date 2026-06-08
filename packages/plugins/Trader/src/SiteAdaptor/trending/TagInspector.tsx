import { useCallback } from 'react'
import { EMPTY_LIST, type SocialIdentity } from '@masknet/shared-base'
import { useDialogStacking } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { EVMWeb3ContextProvider } from '@masknet/web3-hooks-base'
import { DSearch } from '@masknet/web3-providers'
import { TrendingAPI } from '@masknet/web3-providers/types'
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
            _isCollectionProjectPopper?: boolean,
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
}: TrendingViewWrapperProps) {
    const keyword = `${type === TrendingAPI.TagType.CASH ? '$' : '#'}${name}`
    const { data: resultList, isLoading: loadingResultList } = useQuery({
        queryKey: ['dsearch', keyword],
        queryFn: async () => {
            if (!keyword) return EMPTY_LIST
            const results = await DSearch.search<Web3Helper.TokenResultAll>(keyword)
            return results
        },
    })

    if (!resultList?.length || loadingResultList) return null

    return (
        <TrendingViewProvider isDSearch={false} isProfilePage={false} isTokenTagPopper isPreciseSearch={false}>
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
