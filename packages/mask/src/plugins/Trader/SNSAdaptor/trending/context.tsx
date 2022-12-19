import { createContext, PropsWithChildren } from 'react'

interface TrendingViewContextProps {
    isTokenTagPopper: boolean
    isNFTProjectPopper: boolean
    isProfilePage: boolean
    isPreciseSearch: boolean
}

export const TrendingViewContext = createContext<TrendingViewContextProps>({
    isTokenTagPopper: true,
    isNFTProjectPopper: false,
    isProfilePage: false,
    isPreciseSearch: false,
})

export function TrendingViewProvider({
    isTokenTagPopper,
    isNFTProjectPopper,
    isProfilePage,
    isPreciseSearch,
    children,
}: PropsWithChildren<TrendingViewContextProps>) {
    return (
        <TrendingViewContext.Provider
            value={{
                isTokenTagPopper,
                isNFTProjectPopper,
                isProfilePage,
                isPreciseSearch,
            }}>
            {children}
        </TrendingViewContext.Provider>
    )
}
