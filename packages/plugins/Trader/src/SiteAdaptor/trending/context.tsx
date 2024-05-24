import { createContext, useMemo, type PropsWithChildren } from 'react'

interface TrendingViewContextProps {
    isTokenTagPopper: boolean
    isCollectionProjectPopper: boolean
    isProfilePage: boolean
    isPreciseSearch: boolean
    isDSearch: boolean
}

export const TrendingViewContext = createContext<TrendingViewContextProps>({
    isTokenTagPopper: true,
    isCollectionProjectPopper: false,
    isProfilePage: false,
    isPreciseSearch: false,
    isDSearch: false,
})

export function TrendingViewProvider({
    isTokenTagPopper,
    isCollectionProjectPopper,
    isProfilePage,
    isPreciseSearch,
    children,
}: PropsWithChildren<TrendingViewContextProps>) {
    const context = useMemo(
        () => ({
            isTokenTagPopper,
            isDSearch: !isTokenTagPopper && !isCollectionProjectPopper && !isProfilePage,
            isCollectionProjectPopper,
            isProfilePage,
            isPreciseSearch,
        }),
        [isTokenTagPopper, isCollectionProjectPopper, isProfilePage, isPreciseSearch],
    )
    return <TrendingViewContext value={context}>{children}</TrendingViewContext>
}
