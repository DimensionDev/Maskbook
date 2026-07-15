import { createContext, useMemo, type PropsWithChildren } from 'react'

interface TrendingViewContextProps {
    isTokenTagPopper: boolean
    isProfilePage: boolean
    isPreciseSearch: boolean
}

export const TrendingViewContext = createContext<TrendingViewContextProps>({
    isTokenTagPopper: true,
    isProfilePage: false,
    isPreciseSearch: false,
})
TrendingViewContext.displayName = 'TrendingViewContext'

export function TrendingViewProvider({
    isTokenTagPopper,
    isProfilePage,
    isPreciseSearch,
    children,
}: PropsWithChildren<TrendingViewContextProps>) {
    const context = useMemo(
        () => ({
            isTokenTagPopper,
            isDSearch: !isTokenTagPopper && !isProfilePage,
            isProfilePage,
            isPreciseSearch,
        }),
        [isTokenTagPopper, isProfilePage, isPreciseSearch],
    )
    return <TrendingViewContext value={context}>{children}</TrendingViewContext>
}
