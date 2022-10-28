import React, { createContext, ReactNode, useContext, useState } from 'react'
import { compose, NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useAccount } from './useAccount.js'
import { useChainId } from './useChainId.js'
import { omitBy, isUndefined } from 'lodash-unified'
import { useNetworkType } from './useNetworkType.js'
import { useProviderType } from './useProviderType.js'

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
NetworkContext.displayName = 'NetworkContext'

const ChainContext = createContext<ChainContext>(null!)
ChainContext.displayName = 'ChainContext'

function NetworkContextProvider({ value, children }: React.ProviderProps<NetworkPluginID>) {
    const [pluginID, setPluginID] = useState<NetworkPluginID>()
    return (
        <NetworkContext.Provider
            value={{
                pluginID: pluginID ?? value,
                setPluginID,
            }}>
            {children}
        </NetworkContext.Provider>
    )
}

function ChainContextProvider({ value, children }: React.ProviderProps<ChainContextDefaults>) {
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
            }}
            children={children}
        />
    )
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

export function Web3ContextProvider({
    value,
    children,
}: React.ProviderProps<
    {
        pluginID: NetworkPluginID
    } & ChainContextDefaults
>) {
    const { pluginID, ...rest } = value
    return compose(
        (children) => NetworkContextProvider({ value: pluginID, children }),
        (children) => <ChainContextProvider value={rest} children={children} />,
        <>{children}</>,
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
        ...omitBy(defaults, isUndefined),
    } as Required<ChainContext<T>>
}
