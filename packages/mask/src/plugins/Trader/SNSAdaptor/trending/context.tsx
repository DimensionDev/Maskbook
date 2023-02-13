import { createContext, PropsWithChildren } from 'react'

interface TrendingViewContextProps {
    isTokenTagPopper: boolean
    isCollectionProjectPopper: boolean
    isProfilePage: boolean
    isPreciseSearch: boolean
}

export const TrendingViewContext = createContext<TrendingViewContextProps>({
    isTokenTagPopper: true,
    isCollectionProjectPopper: false,
    isProfilePage: false,
    isPreciseSearch: false,
})

export function TrendingViewProvider({
    isTokenTagPopper,
    isCollectionProjectPopper,
    isProfilePage,
    isPreciseSearch,
    children,
}: PropsWithChildren<TrendingViewContextProps>) {
    return (
        <TrendingViewContext.Provider
            value={{
                isTokenTagPopper,
                isCollectionProjectPopper,
                isProfilePage,
                isPreciseSearch,
            }}>
            {children}
        </TrendingViewContext.Provider>
    )
}
