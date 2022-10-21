import React, { createContext, ReactNode, useContext, useState } from 'react'
import { EMPTY_OBJECT, NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useActualAccount } from './useAccount.js'
import { useActualChainId } from './useChainId.js'
import { useActualNetworkType } from './useNetworkType.js'
import { useActualProviderType } from './useProviderType.js'

interface Web3PluginIDContext {
    pluginID: NetworkPluginID
    setPluginID: (pluginID: NetworkPluginID) => void
}

interface Web3Context {
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

const Web3Context = createContext<Web3Context>(null!)

export function PluginIDContextProvider({ value, children }: React.ProviderProps<NetworkPluginID>) {
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

export function Web3ContextProvider<T extends NetworkPluginID>({
    value,
    children,
}: React.ProviderProps<Omit<Web3Context, 'setChainId' | 'setAccount' | 'setNetworkType' | 'setProviderType'>>) {
    const [chainId, setChainId] = useState(value.chainId)
    const [account, setAccount] = useState(value.account)
    const [networkType, setNetworkType] = useState(value.networkType)
    const [providerType, setProviderType] = useState(value.providerType)

    return (
        <Web3Context.Provider
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

export function Web3ActualContextProvider({ children }: { children: ReactNode | undefined }) {
    const value = {
        account: useActualAccount(),
        chainId: useActualChainId(),
        networkType: useActualNetworkType(),
        providerType: useActualProviderType(),
    }
    return <Web3Context.Provider value={value} children={children} />
}

export function GlobalWeb3ContextProvider({ value, children }: React.ProviderProps<NetworkPluginID>) {
    return (
        <PluginIDContextProvider value={value}>
            <Web3ContextProvider value={EMPTY_OBJECT} children={children} />
        </PluginIDContextProvider>
    )
}

export function usePluginIDContext<T extends NetworkPluginID = NetworkPluginID>(expectedPluginID?: T) {
    const context = useContext(PluginIDContext)
    return {
        ...context,
        pluginID: expectedPluginID ?? context.pluginID,
    }
}

export function useWeb3Context(expectedWeb3?: {
    account?: string
    chainId?: Web3Helper.ChainIdAll
    networkType?: Web3Helper.NetworkTypeAll
    providerType?: Web3Helper.ProviderTypeAll
}) {
    const context = useContext(Web3Context)
    return {
        ...context,
        ...expectedWeb3,
    }
}

export function useCurrentWeb3NetworkPluginID(expectedPluginID?: NetworkPluginID) {
    const { pluginID } = usePluginIDContext()
    return expectedPluginID ?? pluginID!
}

export function useCurrentWeb3NetworkAccount<T extends NetworkPluginID>(pluginID?: T) {
    const web3 = useWeb3Context()
    return web3.account as string | undefined
}

export function useCurrentWeb3NetworkChainId<T extends NetworkPluginID>(pluginID?: T) {
    const web3 = useWeb3Context()
    return web3.chainId as Web3Helper.Definition[T]['ChainId'] | undefined
}

export function useCurrentWeb3NetworkProviderType<T extends NetworkPluginID>(pluginID?: T) {
    const web3 = useWeb3Context()
    return web3.providerType as Web3Helper.Definition[T]['ProviderType'] | undefined
}

export function useCurrentWeb3NetworkNetworkType<T extends NetworkPluginID>(pluginID?: T) {
    const web3 = useWeb3Context()
    return web3.networkType as Web3Helper.Definition[T]['NetworkType'] | undefined
}
