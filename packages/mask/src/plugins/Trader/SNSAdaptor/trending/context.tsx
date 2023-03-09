import { createContext, useMemo, type PropsWithChildren } from 'react'

interface TrendingViewContextProps {
    isTokenTagPopper: boolean
    isCollectionProjectPopper: boolean
    badgeBounding?: DOMRect
    isProfilePage: boolean
    isPreciseSearch: boolean
    isDSearch: boolean
}

export const TrendingViewContext = createContext<TrendingViewContextProps>({
    isTokenTagPopper: true,
    isCollectionProjectPopper: false,
    badgeBounding: undefined,
    isProfilePage: false,
    isPreciseSearch: false,
    isDSearch: false,
})

export function TrendingViewProvider({
    isTokenTagPopper,
    isCollectionProjectPopper,
    badgeBounding,
    isProfilePage,
    isPreciseSearch,
    children,
}: PropsWithChildren<TrendingViewContextProps>) {
    const context = useMemo(
        () => ({
            isTokenTagPopper,
            isDSearch: !isTokenTagPopper && !isCollectionProjectPopper && !isProfilePage,
            isCollectionProjectPopper,
            badgeBounding,
            isProfilePage,
            isPreciseSearch,
        }),
        [isTokenTagPopper, isCollectionProjectPopper, badgeBounding, isProfilePage, isPreciseSearch],
    )
    return <TrendingViewContext.Provider value={context}>{children}</TrendingViewContext.Provider>
}
