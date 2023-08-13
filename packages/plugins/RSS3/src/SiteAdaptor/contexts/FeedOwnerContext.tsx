import { createContext, useContext } from 'react'

export interface FeedOwnerOptions {
    address: string
    /** ENS, RNS or SOL, etc */
    name?: string | null
    ownerDisplay: string
}
export const FeedOwnerContext = createContext<FeedOwnerOptions>(null!)

export function useFeedOwner() {
    return useContext(FeedOwnerContext)
}
