import React, { createContext, ReactNode, useContext, useState } from 'react'
import { EMPTY_OBJECT, NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useActualAccount } from './useAccount.js'
import { useActualChainId } from './useChainId.js'
import { useActualNetworkType } from './useNetworkType.js'
import { useActualProviderType } from './useProviderType.js'

interface Web3Context<T extends NetworkPluginID> {
    account?: string
    networkPluginId?: T
    chainId?: Web3Helper.Definition[T]['ChainId']
    networkType?: Web3Helper.Definition[T]['NetworkType']
    providerType?: Web3Helper.Definition[T]['ProviderType']

    setChainId?: (chainId: Web3Helper.Definition[T]['ChainId']) => void
    setAccount?: (account: string) => void
    setNetworkType?: (provider: Web3Helper.Definition[T]['NetworkType']) => void
    setProviderType?: (provider: Web3Helper.Definition[T]['ProviderType']) => void
}

const PluginIDContext = createContext(NetworkPluginID.PLUGIN_EVM)

// Avoid use this context directly
export const PluginWeb3Context = createContext<Web3Context<NetworkPluginID>>(EMPTY_OBJECT)

const PluginsWeb3Context = createContext<Record<NetworkPluginID, Web3Helper.Web3State<NetworkPluginID>>>(null!)

export function PluginIDContextProvider({ value, children }: React.ProviderProps<NetworkPluginID>) {
    return <PluginIDContext.Provider value={value}>{children}</PluginIDContext.Provider>
}

export function PluginWeb3ContextProvider<T extends NetworkPluginID>({
    value,
    children,
}: React.ProviderProps<Omit<Web3Context<T>, 'setChainId'>>) {
    const [chainId, setChainId] = useState<Web3Helper.Definition[T]['ChainId'] | undefined>(value.chainId)
    const [account, setAccount] = useState<string | undefined>(value.account)
    const [networkType, setNetworkType] = useState<Web3Helper.Definition[T]['NetworkType'] | undefined>(
        value.networkType,
    )
    const [providerType, setProviderType] = useState<Web3Helper.Definition[T]['ProviderType'] | undefined>(
        value.providerType,
    )

    return (
        <PluginWeb3Context.Provider
            value={{
                ...value,
                setChainId,
                chainId,
                account,
                setAccount,
                providerType,
                setProviderType,
                networkType,
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

export function PluginsWeb3ContextProvider<T extends NetworkPluginID>({
    pluginID,
    value,
    children,
}: {
    pluginID: T
} & React.ProviderProps<Record<NetworkPluginID, Web3Helper.Web3State<T>>>) {
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
