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

function usePluginWeb3Context() {
    const context = useContext(PluginWeb3Context)
    if (!context) throw new Error('This hook should be used in a provider.')
    return context
}

export function usePluginWeb3State() {
    const { Shared, Utils } = usePluginWeb3Context()
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

export const PluginWeb3Context = createContext<Plugin.Shared.Web3Context>(null!)
export const PluginWeb3StateContext = createContainer(usePluginWeb3State)

export const usePluginWeb3StateContext = PluginWeb3StateContext.useContainer

export function PluginWeb3ContextProvider({ value, children }: React.ProviderProps<Plugin.Shared.Web3Context>) {
    return (
        <PluginWeb3Context.Provider value={value}>
            <PluginWeb3StateContext.Provider>{children}</PluginWeb3StateContext.Provider>
        </PluginWeb3Context.Provider>
    )
}
