import { useMemo, useContext, createContext } from 'react'
import { createContainer } from 'unstated-next'
import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/shim/with-selector'
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
    const account = useSyncExternalStoreWithSelector(
        _.account.subscribe,
        _.account.getCurrentValue,
        _.account.getCurrentValue,
        (s) => s,
    )
    const allowTestnet = useSyncExternalStoreWithSelector(
        _.allowTestnet.subscribe,
        _.allowTestnet.getCurrentValue,
        _.allowTestnet.getCurrentValue,
        (s) => s,
    )
    const tokenPrices = useSyncExternalStoreWithSelector(
        _.tokenPrices.subscribe,
        _.tokenPrices.getCurrentValue,
        _.tokenPrices.getCurrentValue,
        (s) => s,
    )
    const networkType = useSyncExternalStoreWithSelector(
        _.networkType.subscribe,
        _.networkType.getCurrentValue,
        _.networkType.getCurrentValue,
        (s) => s,
    )
    const providerType = useSyncExternalStoreWithSelector(
        _.providerType.subscribe,
        _.providerType.getCurrentValue,
        _.providerType.getCurrentValue,
        (s) => s,
    )
    const walletPrimary = useSyncExternalStoreWithSelector(
        _.walletPrimary.subscribe,
        _.walletPrimary.getCurrentValue,
        _.walletPrimary.getCurrentValue,
        (s) => s,
    )
    const wallets = useSyncExternalStoreWithSelector(
        _.wallets.subscribe,
        _.wallets.getCurrentValue,
        _.wallets.getCurrentValue,
        (s) => s,
    )
    const chainId = useSyncExternalStoreWithSelector(
        _.chainId.subscribe,
        _.chainId.getCurrentValue,
        _.chainId.getCurrentValue,
        (s) => s,
    )
    const chainDetailed = useMemo(() => getChainDetailed(chainId), [chainId])
    const erc20Tokens = useSyncExternalStoreWithSelector(
        _.erc20Tokens.subscribe,
        _.erc20Tokens.getCurrentValue,
        _.erc20Tokens.getCurrentValue,
        (s) => s,
    )
    const erc721Tokens = useSyncExternalStoreWithSelector(
        _.erc721Tokens.subscribe,
        _.erc721Tokens.getCurrentValue,
        _.erc721Tokens.getCurrentValue,
        (s) => s,
    )
    const erc1155Tokens = useSyncExternalStoreWithSelector(
        _.erc1155Tokens.subscribe,
        _.erc1155Tokens.getCurrentValue,
        _.erc1155Tokens.getCurrentValue,
        (s) => s,
    )
    const portfolioProvider = useSyncExternalStoreWithSelector(
        _.portfolioProvider.subscribe,
        _.portfolioProvider.getCurrentValue,
        _.portfolioProvider.getCurrentValue,
        (s) => s,
    )
    return {
        allowTestnet,
        account,
        tokenPrices,
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
