import React, { createContext, type ReactNode, useContext, useState } from 'react'
import { isUndefined, omitBy } from 'lodash-es'
import type { WebExtensionMessage } from '@dimensiondev/holoflows-kit'
import { compose, type MaskEvents, type NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useAccount } from './useAccount.js'
import { useChainId } from './useChainId.js'
import { useNetworkType } from './useNetworkType.js'
import { useProviderType } from './useProviderType.js'

interface EnvironmentContext<T extends NetworkPluginID = NetworkPluginID> {
    pluginID: T
}

interface NetworkContext<T extends NetworkPluginID = NetworkPluginID> {
    pluginID: T
    setPluginID: (pluginID: T) => void
}

interface ChainContextGetter<T extends NetworkPluginID = NetworkPluginID> {
    account?: string
    chainId?: Web3Helper.Definition[T]['ChainId']
    networkType?: Web3Helper.Definition[T]['NetworkType']
    providerType?: Web3Helper.Definition[T]['ProviderType']
}

interface ChainContextSetter<T extends NetworkPluginID = NetworkPluginID> {
    setAccount?: (account: string) => void
    setChainId?: (chainId: Web3Helper.Definition[T]['ChainId']) => void
    setNetworkType?: (networkType: Web3Helper.Definition[T]['NetworkType']) => void
    setProviderType?: (providerType: Web3Helper.Definition[T]['ProviderType']) => void
}

const EnvironmentContext = createContext<EnvironmentContext>(null!)
EnvironmentContext.displayName = 'EnvironmentContext'

const NetworkContext = createContext<NetworkContext>(null!)
NetworkContext.displayName = 'NetworkContext'

const ChainContext = createContext<ChainContextGetter & ChainContextSetter>(null!)
ChainContext.displayName = 'ChainContext'

export function EnvironmentContextProvider({ value, children }: React.ProviderProps<EnvironmentContext>) {
    return <EnvironmentContext.Provider value={value}>{children}</EnvironmentContext.Provider>
}

export function NetworkContextProvider({ value, children }: React.ProviderProps<NetworkPluginID>) {
    const [pluginID = value, setPluginID] = useState<NetworkPluginID>()
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

export function ChainContextProvider({ value, children }: React.ProviderProps<ChainContextGetter>) {
    const { pluginID } = useNetworkContext()

    const globalAccount = useAccount(pluginID)
    const globalChainId = useChainId(pluginID)
    const globalNetworkType = useNetworkType(pluginID)
    const globalProviderType = useProviderType(pluginID)
    const [account, setAccount] = useState<string>()
    const [chainId, setChainId] = useState<Web3Helper.ChainIdAll>()
    const [networkType, setNetworkType] = useState<Web3Helper.NetworkTypeAll>()
    const [providerType, setProviderType] = useState<Web3Helper.ProviderTypeAll>()

    return (
        <ChainContext.Provider
            value={{
                ...value,
                account: account ?? value.account ?? globalAccount,
                chainId: chainId ?? value.chainId ?? globalChainId,
                networkType: networkType ?? value.networkType ?? globalNetworkType,
                providerType: providerType ?? value.providerType ?? globalProviderType,
                setAccount,
                setChainId,
                setNetworkType,
                setProviderType,
            }}>
            {children}
        </ChainContext.Provider>
    )
}

export function Web3ContextProvider({
    value,
    children,
}: React.ProviderProps<
    {
        pluginID: NetworkPluginID
        messages?: WebExtensionMessage<MaskEvents>
    } & ChainContextGetter
>) {
    const { pluginID, ...rest } = value
    return compose(
        (children) => <NetworkContextProvider value={pluginID} children={children} />,
        (children) => <ChainContextProvider value={rest} children={children} />,
        <>{children}</>,
    )
}

export function ActualNetworkContextProvider({ children }: { children: ReactNode | undefined }) {
    const { pluginID } = useContext(EnvironmentContext)
    const value = {
        pluginID,
        setPluginID: () => {
            throw new Error('Set pluginID is not allowed.')
        },
    }
    return <NetworkContext.Provider value={value} children={children} />
}

export function ActualChainContextProvider({ children }: { children: ReactNode | undefined }) {
    const value = {
        account: useAccount(),
        chainId: useChainId(),
        networkType: useNetworkType(),
        providerType: useProviderType(),
    }
    return <ChainContext.Provider value={value} children={children} />
}

export function useEnvironmentContext(defaults?: EnvironmentContext) {
    const context = useContext(EnvironmentContext)
    return {
        ...context,
        ...omitBy(defaults, isUndefined),
    }
}

export function useNetworkContext<T extends NetworkPluginID = NetworkPluginID>(defaults?: T) {
    const context = useContext(NetworkContext)
    return {
        ...context,
        pluginID: (defaults ?? context.pluginID) as T,
    }
}

export function useChainContext<T extends NetworkPluginID = NetworkPluginID>(defaults?: ChainContextGetter) {
    const context = useContext(ChainContext)
    return {
        ...context,
        ...omitBy(defaults, isUndefined),
    } as Required<ChainContextGetter<T> & ChainContextSetter<T>>
}
