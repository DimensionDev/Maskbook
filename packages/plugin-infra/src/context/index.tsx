import React, { createContext, useContext } from 'react'
import { createContainer } from 'unstated-next'
import { useSubscription } from 'use-subscription'
import type { Plugin } from '..'
import { createConstantSubscription } from '../utils'

// network plugins
const PLUGIN_EVM_ID = 'com.maskbook.evm'
const PLUGIN_FLOW_ID = 'com.maskbook.flow'

// constant subscriptions
const ZERO = createConstantSubscription(0)
const ZERO_STRING = createConstantSubscription('0')
const EMPTY_STRING = createConstantSubscription('')
const EMPTY_ARRAY = createConstantSubscription([])
const FALSE = createConstantSubscription(false)
const NULL = createConstantSubscription(null)

const PluginIDContext = createContext(PLUGIN_EVM_ID)

const PluginsWeb3Context = createContext<Record<string, Plugin.Shared.Web3State>>(null!)

function usePluginsWeb3Context() {
    const context = useContext(PluginsWeb3Context)
    if (!context) throw new Error('This hook should be used in a provider.')
    return context
}

function usePluginWeb3State(pluginID: string, context: Record<string, Plugin.Shared.Web3State>) {
    const pluginContext = context[pluginID]
    if (!pluginContext) throw new Error(`The context of ${pluginID} is undefined.`)

    const { Shared, Utils } = pluginContext
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
    const currencyType = useSubscription(Shared?.currencyType ?? EMPTY_STRING)
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

function usePluginsWeb3State() {
    const context = usePluginsWeb3Context()
    return {
        [PLUGIN_EVM_ID]: usePluginWeb3State(PLUGIN_EVM_ID, context),
        [PLUGIN_FLOW_ID]: usePluginWeb3State(PLUGIN_FLOW_ID, context),
    }
}

const PluginsWeb3StateContext = createContainer(usePluginsWeb3State)

export const usePluginsWeb3StateContext = PluginsWeb3StateContext.useContainer

export function usePluginWeb3StateContext(expectedPluginID?: string) {
    const pluginID = useContext(PluginIDContext)
    const pluginsWeb3State = usePluginsWeb3StateContext()
    // @ts-ignore
    return pluginsWeb3State[expectedPluginID ?? pluginID] as ReturnType<typeof usePluginWeb3State>
}

export function PluginsWeb3ContextProvider({
    pluginID,
    value,
    children,
}: { pluginID: string } & React.ProviderProps<Record<string, Plugin.Shared.Web3State>>) {
    return (
        <PluginIDContext.Provider value={pluginID}>
            <PluginsWeb3Context.Provider value={value}>
                <PluginsWeb3StateContext.Provider>{children}</PluginsWeb3StateContext.Provider>
            </PluginsWeb3Context.Provider>
        </PluginIDContext.Provider>
    )
}
