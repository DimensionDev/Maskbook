import React, { createContext, useContext, useMemo } from 'react'
import { createContainer } from 'unstated-next'
import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/with-selector'
import { CurrencyType, NetworkPluginID, Web3Plugin } from '../web3-types'
import { createConstantSubscription } from '@masknet/shared-base'

// constant subscriptions
const ZERO = createConstantSubscription(0)
const ZERO_STRING = createConstantSubscription('0')
const USD_CURRENCY = createConstantSubscription(CurrencyType.USD)
const EMPTY_STRING = createConstantSubscription('')
const EMPTY_ARRAY = createConstantSubscription([])
const EMPTY_OBJECT = createConstantSubscription({})
const FALSE = createConstantSubscription(false)
const NULL = createConstantSubscription(null)

const PluginIDContext = createContext(NetworkPluginID.PLUGIN_EVM)

const PluginsWeb3Context = createContext<Record<string, Web3Plugin.ObjectCapabilities.Capabilities>>(null!)

function usePluginsWeb3Context() {
    const context = useContext(PluginsWeb3Context)
    if (!context) throw new Error('This hook should be used in a provider.')
    return context
}

function usePluginWeb3State(pluginID: string, context: Record<string, Web3Plugin.ObjectCapabilities.Capabilities>) {
    const pluginContext = context[pluginID]

    const { Shared, Utils } = pluginContext ?? {}
    const allowTestnet = useSyncExternalStoreWithSelector(
        (Shared?.allowTestnet ?? FALSE).subscribe,
        (Shared?.allowTestnet ?? FALSE).getCurrentValue,
        (Shared?.allowTestnet ?? FALSE).getCurrentValue,
        (s) => s,
    )
    const chainId = useSyncExternalStoreWithSelector(
        (Shared?.chainId ?? ZERO).subscribe,
        (Shared?.chainId ?? ZERO).getCurrentValue,
        (Shared?.chainId ?? ZERO).getCurrentValue,
        (s) => s,
    )
    const account = useSyncExternalStoreWithSelector(
        (Shared?.account ?? EMPTY_STRING).subscribe,
        (Shared?.account ?? EMPTY_STRING).getCurrentValue,
        (Shared?.account ?? EMPTY_STRING).getCurrentValue,
        (s) => s,
    )
    const networkType = useSyncExternalStoreWithSelector(
        (Shared?.networkType ?? EMPTY_STRING).subscribe,
        (Shared?.networkType ?? EMPTY_STRING).getCurrentValue,
        (Shared?.networkType ?? EMPTY_STRING).getCurrentValue,
        (s) => s,
    )
    const providerType = useSyncExternalStoreWithSelector(
        (Shared?.providerType ?? EMPTY_STRING).subscribe,
        (Shared?.providerType ?? EMPTY_STRING).getCurrentValue,
        (Shared?.providerType ?? EMPTY_STRING).getCurrentValue,
        (s) => s,
    )
    const assetType = useSyncExternalStoreWithSelector(
        (Shared?.assetType ?? EMPTY_STRING).subscribe,
        (Shared?.assetType ?? EMPTY_STRING).getCurrentValue,
        (Shared?.assetType ?? EMPTY_STRING).getCurrentValue,
        (s) => s,
    )
    const nameType = useSyncExternalStoreWithSelector(
        (Shared?.nameType ?? EMPTY_STRING).subscribe,
        (Shared?.nameType ?? EMPTY_STRING).getCurrentValue,
        (Shared?.nameType ?? EMPTY_STRING).getCurrentValue,
        (s) => s,
    )
    const collectibleType = useSyncExternalStoreWithSelector(
        (Shared?.collectibleType ?? EMPTY_STRING).subscribe,
        (Shared?.collectibleType ?? EMPTY_STRING).getCurrentValue,
        (Shared?.collectibleType ?? EMPTY_STRING).getCurrentValue,
        (s) => s,
    )
    const transactionType = useSyncExternalStoreWithSelector(
        (Shared?.transactionType ?? EMPTY_STRING).subscribe,
        (Shared?.transactionType ?? EMPTY_STRING).getCurrentValue,
        (Shared?.transactionType ?? EMPTY_STRING).getCurrentValue,
        (s) => s,
    )
    const currencyType = useSyncExternalStoreWithSelector(
        (Shared?.currencyType ?? USD_CURRENCY).subscribe,
        (Shared?.currencyType ?? USD_CURRENCY).getCurrentValue,
        (Shared?.currencyType ?? USD_CURRENCY).getCurrentValue,
        (s) => s,
    )
    const prices = useSyncExternalStoreWithSelector(
        (Shared?.prices ?? NULL).subscribe,
        (Shared?.prices ?? NULL).getCurrentValue,
        (Shared?.prices ?? NULL).getCurrentValue,
        (s) => s,
    )
    const walletPrimary = useSyncExternalStoreWithSelector(
        (Shared?.walletPrimary ?? NULL).subscribe,
        (Shared?.walletPrimary ?? NULL).getCurrentValue,
        (Shared?.walletPrimary ?? NULL).getCurrentValue,
        (s) => s,
    )
    const wallets = useSyncExternalStoreWithSelector(
        (Shared?.wallets ?? EMPTY_ARRAY).subscribe,
        (Shared?.wallets ?? EMPTY_ARRAY).getCurrentValue,
        (Shared?.wallets ?? EMPTY_ARRAY).getCurrentValue,
        (s) => s,
    )
    const fungibleTokens = useSyncExternalStoreWithSelector(
        (Shared?.fungibleTokens ?? EMPTY_ARRAY).subscribe,
        (Shared?.fungibleTokens ?? EMPTY_ARRAY).getCurrentValue,
        (Shared?.fungibleTokens ?? EMPTY_ARRAY).getCurrentValue,
        (s) => s,
    )
    const nonFungibleTokens = useSyncExternalStoreWithSelector(
        (Shared?.nonFungibleTokens ?? EMPTY_ARRAY).subscribe,
        (Shared?.nonFungibleTokens ?? EMPTY_ARRAY).getCurrentValue,
        (Shared?.nonFungibleTokens ?? EMPTY_ARRAY).getCurrentValue,
        (s) => s,
    )

    return {
        allowTestnet,
        chainId,
        account,
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
    const pluginStateEVM = usePluginWeb3State(NetworkPluginID.PLUGIN_EVM, context)
    const pluginStateFlow = usePluginWeb3State(NetworkPluginID.PLUGIN_FLOW, context)
    const pluginStateSolana = usePluginWeb3State(NetworkPluginID.PLUGIN_SOLANA, context)
    return useMemo(
        () => ({
            [NetworkPluginID.PLUGIN_EVM]: pluginStateEVM,
            [NetworkPluginID.PLUGIN_FLOW]: pluginStateFlow,
            [NetworkPluginID.PLUGIN_SOLANA]: pluginStateSolana,
        }),
        [pluginStateEVM, pluginStateFlow, pluginStateSolana],
    )
}

export function useCurrentWeb3NetworkPluginID() {
    return useContext(PluginIDContext)
}

const PluginsWeb3StateContext = createContainer(usePluginsWeb3State)

export const usePluginsWeb3StateContext = PluginsWeb3StateContext.useContainer

export function usePluginWeb3StateContext(expectedPluginID?: NetworkPluginID) {
    const pluginID = useCurrentWeb3NetworkPluginID()
    const pluginsWeb3State = usePluginsWeb3StateContext()
    return pluginsWeb3State[expectedPluginID ?? pluginID] ?? {}
}

export function PluginsWeb3ContextProvider({
    pluginID,
    value,
    children,
}: { pluginID: string } & React.ProviderProps<Record<string, Web3Plugin.ObjectCapabilities.Capabilities>>) {
    return (
        <PluginIDContext.Provider value={pluginID as NetworkPluginID}>
            <PluginsWeb3Context.Provider value={value}>
                <PluginsWeb3StateContext.Provider>{children}</PluginsWeb3StateContext.Provider>
            </PluginsWeb3Context.Provider>
        </PluginIDContext.Provider>
    )
}
