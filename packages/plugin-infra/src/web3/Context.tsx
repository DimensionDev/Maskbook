import React, { createContext, useContext, useMemo } from 'react'
import { createContainer } from 'unstated-next'
import { useSubscription } from 'use-subscription'
import { createConstantSubscription } from '@masknet/shared-base'
import { CurrencyType, NetworkPluginID, Web3Plugin } from '../web3-types'

// constant subscriptions
const ZERO = createConstantSubscription(0)
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

    const {
        AddressBook,
        RiskWarning,
        Token,
        TokenList,
        TokenPrice,
        Transaction,
        NameService,
        Protocol,
        Provider,
        Wallet,
        Settings,
        Utils,
    } = pluginContext ?? {}
    const allowTestnet = useSubscription(Settings?.allowTestnet ?? FALSE)
    const addressBook = useSubscription(AddressBook?.addressBook ?? EMPTY_ARRAY)
    const currencyType = useSubscription(Settings?.currencyType ?? USD_CURRENCY)
    const chainId = useSubscription(Provider?.chainId ?? ZERO)
    const account = useSubscription(Provider?.account ?? EMPTY_STRING)
    const networkType = useSubscription(Provider?.networkType ?? EMPTY_STRING)
    const providerType = useSubscription(Provider?.providerType ?? EMPTY_STRING)
    const tokenPrices = useSubscription(TokenPrice?.tokenPrices ?? NULL)
    const domainBook = useSubscription(NameService?.domainBook ?? EMPTY_OBJECT)
    const confirmationBook = useSubscription(RiskWarning?.confirmationBook ?? EMPTY_OBJECT)
    const transactions = useSubscription(Transaction?.transactions ?? EMPTY_ARRAY)
    const walletPrimary = useSubscription(Wallet?.walletPrimary ?? NULL)
    const wallets = useSubscription(Wallet?.wallets ?? EMPTY_ARRAY)
    const fungibleTokens = useSubscription(Token?.fungibleTokens ?? EMPTY_ARRAY)
    const nonFungibleTokens = useSubscription(Token?.nonFungibleTokens ?? EMPTY_ARRAY)
    const fungibleTokenList = useSubscription(TokenList?.fungibleTokens ?? EMPTY_ARRAY)
    const nonFungibleTokenList = useSubscription(TokenList?.nonFungibleTokens ?? EMPTY_ARRAY)

    return {
        allowTestnet,
        account,
        addressBook,
        domainBook,
        chainId,
        confirmationBook,
        networkType,
        providerType,
        currencyType,
        tokenPrices,
        transactions,
        walletPrimary,
        wallets,
        fungibleTokens,
        nonFungibleTokens,
        fungibleTokenList,
        nonFungibleTokenList,
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

export function useCurrentWeb3NetworkPluginID(expectedPluginID?: NetworkPluginID) {
    const pluginID = useContext(PluginIDContext)
    return expectedPluginID ?? pluginID
}

const PluginsWeb3StateContext = createContainer(usePluginsWeb3State)

export const usePluginsWeb3StateContext = PluginsWeb3StateContext.useContainer

export function usePluginWeb3StateContext(expectedPluginID?: NetworkPluginID) {
    const pluginID = useCurrentWeb3NetworkPluginID(expectedPluginID)
    const pluginsWeb3State = usePluginsWeb3StateContext()
    return pluginsWeb3State[pluginID] ?? {}
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
