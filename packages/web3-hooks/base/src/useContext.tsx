import React, { createContext, ReactNode, useContext, useState } from 'react'
import { EMPTY_OBJECT, NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useActualAccount } from './useAccount.js'
import { useActualChainId } from './useChainId.js'
import { useActualNetworkType } from './useNetworkType.js'
import { useActualProviderType } from './useProviderType.js'

interface Web3PluginIDContext {
    pluginID?: NetworkPluginID
    setPluginID?: (pluginID: NetworkPluginID) => void
}

interface Web3Context<T extends NetworkPluginID> {
    pluginID?: T
    account?: string
    chainId?: Web3Helper.ChainIdAll
    networkType?: Web3Helper.NetworkTypeAll
    providerType?: Web3Helper.ProviderTypeAll
    setAccount?: (account: string) => void
    setChainId?: (chainId: Web3Helper.ChainIdAll) => void
    setNetworkType?: (provider: Web3Helper.NetworkTypeAll) => void
    setProviderType?: (provider: Web3Helper.ProviderTypeAll) => void
}

const PluginIDContext = createContext<Web3PluginIDContext>(null!)

export const PluginWeb3Context = createContext<Web3Context<NetworkPluginID>>(null!)

export function PluginIDContextProvider({ value, children }: React.ProviderProps<NetworkPluginID | undefined>) {
    const [pluginID, setPluginID] = useState(value)
    return (
        <PluginIDContext.Provider
            value={{
                pluginID,
                setPluginID,
            }}>
            {children}
        </PluginIDContext.Provider>
    )
}

export function PluginWeb3ContextProvider<T extends NetworkPluginID>({
    value,
    children,
}: React.ProviderProps<Omit<Web3Context<T>, 'setChainId' | 'setAccount' | 'setNetworkType' | 'setProviderType'>>) {
    const [chainId, setChainId] = useState(value.chainId)
    const [account, setAccount] = useState(value.account)
    const [networkType, setNetworkType] = useState(value.networkType)
    const [providerType, setProviderType] = useState(value.providerType)

    return (
        <PluginWeb3Context.Provider
            value={{
                ...value,
                chainId,
                account,
                providerType,
                networkType,
                setAccount,
                setChainId,
                setProviderType,
                setNetworkType,
            }}
            children={children}
        />
    )
}

export function PluginWeb3ActualContextProvider({ children }: { children: ReactNode | undefined }) {
    const value = {
        account: useActualAccount(),
        chainId: useActualChainId(),
        networkType: useActualNetworkType(),
        providerType: useActualProviderType(),
    }
    return <PluginWeb3Context.Provider value={value} children={children} />
}

export function PluginsWeb3ContextProvider({ value, children }: React.ProviderProps<NetworkPluginID>) {
    return (
        <PluginIDContextProvider value={value}>
            <PluginWeb3ContextProvider value={EMPTY_OBJECT} children={children} />
        </PluginIDContextProvider>
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
