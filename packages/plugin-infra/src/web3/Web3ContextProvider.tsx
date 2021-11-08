import { noop } from 'lodash-es'
import React, { createContext, useContext } from 'react'
import { createContainer } from 'unstated-next'
import { useSubscription } from 'use-subscription'
import type { Plugin } from '..'

function createSubscription<T>(value: T) {
    return {
        getCurrentValue: () => value,
        subscribe: () => noop,
    }
}

const ZERO = createSubscription(0)
const ZERO_STRING = createSubscription('0')
const EMPTY_STRING = createSubscription('')
const EMPTY_ARRAY = createSubscription([])
const FALSE = createSubscription(false)
const NULL = createSubscription(null)

function useWeb3Context() {
    const context = useContext(Web3Context)
    if (!context) throw new Error('This hook should be used in a provider.')
    return context
}

export function useWeb3State() {
    const { Shared, Utils } = useWeb3Context()
    const allowTestnet = useSubscription(Shared?.allowTestnet ?? FALSE)
    const chainId = useSubscription(Shared?.chainId ?? ZERO)
    const account = useSubscription(Shared?.account ?? EMPTY_STRING)
    const balance = useSubscription(Shared?.balance ?? ZERO_STRING)
    const blockNumber = useSubscription(Shared?.blockNumber ?? ZERO)
    const networkType = useSubscription(Shared?.networkType ?? EMPTY_STRING)
    const providerType = useSubscription(Shared?.providerType ?? EMPTY_STRING)
    const assetType = useSubscription(Shared?.assetType ?? EMPTY_STRING)
    const nameType = useSubscription(Shared?.nameType ?? EMPTY_STRING)
    const collectibleType = useSubscription(Shared?.collectibleType ?? EMPTY_STRING)
    const transactionType = useSubscription(Shared?.transactionType ?? EMPTY_STRING)
    const currencyType = useSubscription(
        Shared?.currencyType ?? createSubscription('usd' as Plugin.Shared.CurrencyType),
    )
    const prices = useSubscription(Shared?.prices ?? NULL)
    const walletPrimary = useSubscription(Shared?.walletPrimary ?? NULL)
    const wallets = useSubscription(Shared?.wallets ?? EMPTY_ARRAY)
    const fungibleTokens = useSubscription(Shared?.fungibleTokens ?? EMPTY_ARRAY)
    const nonFungibleTokens = useSubscription(Shared?.nonFungibleTokens ?? EMPTY_ARRAY)

    return {
        allowTestnet,
        chainId,
        chainIdValid: !account || (Utils?.isChainIdValid(chainId, allowTestnet) ?? false),
        chainDetailed: Utils?.getChainDetailed(chainId) ?? null,
        account,
        balance,
        blockNumber,
        networkType,
        providerType,
        assetType,
        nameType,
        collectibleType,
        transactionType,
        currencyType,
        prices,
        walletPrimary,
        wallets,
        fungibleTokens,
        nonFungibleTokens,
    }
}

export const Web3Context = createContext<Plugin.Shared.Web3Context>(null!)
export const Web3StateContext = createContainer(useWeb3State)

export const useWeb3StateContext = Web3StateContext.useContainer

export function Web3ContextProvider({ value, children }: React.ProviderProps<Plugin.Shared.Web3Context>) {
    return (
        <Web3Context.Provider value={value}>
            <Web3StateContext.Provider>{children}</Web3StateContext.Provider>
        </Web3Context.Provider>
    )
}
