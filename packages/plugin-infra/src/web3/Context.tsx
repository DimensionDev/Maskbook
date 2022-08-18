import React, { createContext, useContext } from 'react'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { EMPTY_OBJECT } from '@masknet/shared-base'
import type { Web3Helper } from '../web3-helpers'

interface Web3Context<T extends NetworkPluginID> {
    account?: string
    chainId?: Web3Helper.Definition[T]['ChainId']
    networkType?: Web3Helper.Definition[T]['NetworkType']
    providerType?: Web3Helper.Definition[T]['ProviderType']
}

const PluginIDContext = createContext(NetworkPluginID.PLUGIN_EVM)

const PluginWeb3Context = createContext<Web3Context<NetworkPluginID>>(EMPTY_OBJECT)

const PluginsWeb3Context = createContext<Record<NetworkPluginID, Web3Helper.Web3State<NetworkPluginID>>>(null!)

export function PluginIDContextProvider({ value, children }: React.ProviderProps<NetworkPluginID>) {
    return <PluginIDContext.Provider value={value}>{children}</PluginIDContext.Provider>
}

export function PluginWeb3ContextProvider<T extends NetworkPluginID>({
    pluginID,
    value,
    children,
}: { pluginID: T } & React.ProviderProps<Web3Context<T>>) {
    return <PluginWeb3Context.Provider value={value} children={children} />
}

export function PluginsWeb3ContextProvider<T extends NetworkPluginID>({
    pluginID,
    value,
    children,
}: { pluginID: T } & React.ProviderProps<Record<NetworkPluginID, Web3Helper.Web3State<T>>>) {
    return (
        <PluginIDContext.Provider value={pluginID}>
            <PluginsWeb3Context.Provider value={value}>
                <PluginWeb3Context.Provider value={EMPTY_OBJECT} children={children} />
            </PluginsWeb3Context.Provider>
        </PluginIDContext.Provider>
    )
}

export function useCurrentWeb3NetworkPluginID(expectedPluginID?: NetworkPluginID) {
    const pluginID = useContext(PluginIDContext)
    return expectedPluginID ?? pluginID
}

export function useCurrentWeb3NetworkAccount<T extends NetworkPluginID>(pluginID?: T) {
    const pluginWeb3Context = useContext(PluginWeb3Context)
    return pluginWeb3Context.account as string | undefined
}

export function useCurrentWeb3NetworkChainId<T extends NetworkPluginID>(pluginID?: T) {
    const pluginWeb3Context = useContext(PluginWeb3Context)
    return pluginWeb3Context.chainId as Web3Helper.Definition[T]['ChainId'] | undefined
}

export function useCurrentWeb3NetworkProviderType<T extends NetworkPluginID>(pluginID?: T) {
    const pluginWeb3Context = useContext(PluginWeb3Context)
    return pluginWeb3Context.providerType as Web3Helper.Definition[T]['ProviderType'] | undefined
}

export function useCurrentWeb3NetworkNetworkType<T extends NetworkPluginID>(pluginID?: T) {
    const pluginWeb3Context = useContext(PluginWeb3Context)
    return pluginWeb3Context.networkType as Web3Helper.Definition[T]['NetworkType'] | undefined
}
