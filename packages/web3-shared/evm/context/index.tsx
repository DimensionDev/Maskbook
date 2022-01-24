import { useMemo, useContext, createContext } from 'react'
import { createContainer } from 'unstated-next'
import { useSubscription } from 'use-subscription'
import type { Web3ProviderType } from './type'
import { getChainDetailed, isChainIdValid } from '../utils'

export type { Web3ProviderType } from './type'

export const Web3ProviderContext = createContext<Web3ProviderType>(null!)

/** @internal */
export function useWeb3Context() {
    const context = useContext(Web3ProviderContext)
    if (!context) throw new Error('This hook should be used in a provider.')
    return context
}

export function useWeb3State() {
    const _ = useWeb3Context()
    const account = useSubscription(_.account)
    const allowTestnet = useSubscription(_.allowTestnet)
    const balance = useSubscription(_.balance)
    const blockNumber = useSubscription(_.blockNumber)
    const tokenPrices = useSubscription(_.tokenPrices)
    const networkType = useSubscription(_.networkType)
    const providerType = useSubscription(_.providerType)
    const walletPrimary = useSubscription(_.walletPrimary)
    const wallets = useSubscription(_.wallets)
    const chainId = useSubscription(_.chainId)
    const chainDetailed = useMemo(() => getChainDetailed(chainId), [chainId])
    const erc20Tokens = useSubscription(_.erc20Tokens)
    const erc721Tokens = useSubscription(_.erc721Tokens)
    const erc1155Tokens = useSubscription(_.erc1155Tokens)
    const portfolioProvider = useSubscription(_.portfolioProvider)
    return {
        allowTestnet,
        account,
        tokenPrices,
        balance,
        blockNumber,
        networkType,
        providerType,
        walletPrimary,
        wallets,
        chainId,
        chainDetailed,
        erc20Tokens,
        erc721Tokens,
        erc1155Tokens,
        portfolioProvider,
        chainIdValid: !account || isChainIdValid(chainId, allowTestnet),
    }
}

export const Web3Context = createContainer(useWeb3State)
export const useWeb3StateContext = Web3Context.useContainer

// Web3ProviderContext is used to provide a set of API to interact with Web3.
// Web3Context is used to provide a scoped shared state within this provider.
export function Web3Provider(props: React.ProviderProps<Web3ProviderType>) {
    return (
        <Web3ProviderContext.Provider value={props.value}>
            <Web3Context.Provider>{props.children}</Web3Context.Provider>
        </Web3ProviderContext.Provider>
    )
}
