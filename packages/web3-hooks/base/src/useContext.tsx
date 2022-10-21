import React, { createContext, useContext, useState } from 'react'
import { EMPTY_OBJECT, NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'

interface NetworkContext {
    pluginID: NetworkPluginID
    setPluginID: (pluginID: NetworkPluginID) => void
}

interface ChainContext<T extends NetworkPluginID = NetworkPluginID> {
    account?: string
    chainId?: Web3Helper.Definition[T]['ChainId']
    networkType?: Web3Helper.Definition[T]['NetworkType']
    providerType?: Web3Helper.Definition[T]['ProviderType']
    setAccount?: (account: string) => void
    setChainId?: (chainId: Web3Helper.Definition[T]['ChainId']) => void
    setNetworkType?: (provider: Web3Helper.Definition[T]['NetworkType']) => void
    setProviderType?: (provider: Web3Helper.Definition[T]['ProviderType']) => void
}

type ChainContextDefaults<T extends NetworkPluginID = NetworkPluginID> = Omit<
    ChainContext<T>,
    'setChainId' | 'setAccount' | 'setNetworkType' | 'setProviderType'
>

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

export function ChainContextProvider({ value, children }: React.ProviderProps<ChainContextDefaults>) {
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

export function Web3ContextProvider({ value, children }: React.ProviderProps<NetworkPluginID>) {
    return (
        <NetworkContextProvider value={value}>
            <ChainContextProvider value={EMPTY_OBJECT} children={children} />
        </NetworkContextProvider>
    )
}

export function useNetworkContext<T extends NetworkPluginID = NetworkPluginID>(defaults?: T) {
    const context = useContext(NetworkContext)
    return {
        ...context,
        pluginID: (defaults ?? context.pluginID) as T,
    }
}

export function useChainContext<T extends NetworkPluginID = NetworkPluginID>(defaults?: ChainContextDefaults) {
    const context = useContext(ChainContext)
    return {
        ...context,
        ...defaults,
    } as Required<ChainContext<T>>
}
