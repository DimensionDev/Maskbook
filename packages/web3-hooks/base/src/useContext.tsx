import React, { createContext, ReactNode, useContext, useState } from 'react'
import { EMPTY_OBJECT, NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useActualAccount } from './useAccount.js'
import { useActualChainId } from './useChainId.js'
import { useActualNetworkType } from './useNetworkType.js'
import { useActualProviderType } from './useProviderType.js'

interface NetworkContext {
    pluginID: NetworkPluginID
    setPluginID: (pluginID: NetworkPluginID) => void
}

interface ChainContext {
    account?: string
    chainId?: Web3Helper.ChainIdAll
    networkType?: Web3Helper.NetworkTypeAll
    providerType?: Web3Helper.ProviderTypeAll
    setAccount?: (account: string) => void
    setChainId?: (chainId: Web3Helper.ChainIdAll) => void
    setNetworkType?: (provider: Web3Helper.NetworkTypeAll) => void
    setProviderType?: (provider: Web3Helper.ProviderTypeAll) => void
}

const NetworkContext = createContext<NetworkContext>(null!)

const ChainContext = createContext<ChainContext>(null!)

export function NetworkContextProvider({ value, children }: React.ProviderProps<NetworkPluginID>) {
    const [pluginID, setPluginID] = useState(value)
    return (
        <NetworkContext.Provider
            value={{
                pluginID,
                setPluginID,
            }}>
            {children}
        </NetworkContext.Provider>
    )
}

export function ChainContextProvider({
    value,
    children,
}: React.ProviderProps<Omit<ChainContext, 'setChainId' | 'setAccount' | 'setNetworkType' | 'setProviderType'>>) {
    const [chainId, setChainId] = useState(value.chainId)
    const [account, setAccount] = useState(value.account)
    const [networkType, setNetworkType] = useState(value.networkType)
    const [providerType, setProviderType] = useState(value.providerType)

    return (
        <ChainContext.Provider
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

export function ActualChainContextProvider({ children }: { children: ReactNode | undefined }) {
    const value = {
        account: useActualAccount(),
        chainId: useActualChainId(),
        networkType: useActualNetworkType(),
        providerType: useActualProviderType(),
    }
    return <ChainContext.Provider value={value} children={children} />
}

export function Web3ContextProvider({ value, children }: React.ProviderProps<NetworkPluginID>) {
    return (
        <NetworkContextProvider value={value}>
            <ChainContextProvider value={EMPTY_OBJECT} children={children} />
        </NetworkContextProvider>
    )
}

export function useNetworkContext<T extends NetworkPluginID = NetworkPluginID>(expectedPluginID?: T) {
    const context = useContext(NetworkContext)
    return {
        ...context,
        pluginID: (expectedPluginID ?? context.pluginID) as T,
    }
}

export function useChainContext(expectedWeb3?: {
    account?: string
    chainId?: Web3Helper.ChainIdAll
    networkType?: Web3Helper.NetworkTypeAll
    providerType?: Web3Helper.ProviderTypeAll
}) {
    const context = useContext(ChainContext)
    return {
        ...context,
        ...expectedWeb3,
    }
}
