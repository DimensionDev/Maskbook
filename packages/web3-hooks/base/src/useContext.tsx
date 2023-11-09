import { createContext, type ReactNode, useContext, useState, useMemo, type ProviderProps, memo } from 'react'
import { isUndefined, omitBy } from 'lodash-es'
import { usePersistSubscription, useValueRef } from '@masknet/shared-base-ui'
import { compose, Sniffings, NetworkPluginID, getSiteType, pluginIDsSettings } from '@masknet/shared-base'
import { EVMWalletProviders, type BaseEIP4337WalletProvider } from '@masknet/web3-providers'
import { ProviderType } from '@masknet/web3-shared-evm'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useAccount } from './useAccount.js'
import { useChainId } from './useChainId.js'
import { useProviderType } from './useProviderType.js'
import { useLocation } from 'react-use'

interface ReadonlyNetworkContext<T extends NetworkPluginID = NetworkPluginID> {
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
    // If it's controlled, we prefer passed value over state inside
    controlled?: boolean
}

interface ChainContextSetter<T extends NetworkPluginID = NetworkPluginID> {
    setAccount?: (account: string) => void
    setChainId?: (chainId: Web3Helper.Definition[T]['ChainId']) => void
    setNetworkType?: (networkType: Web3Helper.Definition[T]['NetworkType']) => void
    setProviderType?: (providerType: Web3Helper.Definition[T]['ProviderType']) => void
}

const ReadonlyNetworkContext = createContext<ReadonlyNetworkContext>(null!)
ReadonlyNetworkContext.displayName = 'ReadonlyNetworkContext'

const NetworkContext = createContext<NetworkContext>(null!)
NetworkContext.displayName = 'NetworkContext'

const ChainContext = createContext<ChainContextGetter & ChainContextSetter>(null!)
ChainContext.displayName = 'ChainContext'

/**
 * Provide the current readonly network plugin ID (readonly)
 * @param props
 * @returns
 */
export function ReadonlyNetworkContextProvider({ value, children }: ProviderProps<ReadonlyNetworkContext>) {
    return <ReadonlyNetworkContext.Provider value={value}>{children}</ReadonlyNetworkContext.Provider>
}

/**
 * Provide the current selected network plugin ID
 * @param props
 * @returns
 */
export function NetworkContextProvider({ value, children }: ProviderProps<NetworkPluginID>) {
    const [pluginID = value, setPluginID] = useState<NetworkPluginID>()
    const context = useMemo(
        () => ({
            pluginID,
            setPluginID,
        }),
        [pluginID],
    )
    return <NetworkContext.Provider value={context}>{children}</NetworkContext.Provider>
}

/**
 * Provide the current chain context
 * @param props
 * @returns
 */
export const ChainContextProvider = memo(function ChainContextProvider({
    value,
    children,
}: ProviderProps<ChainContextGetter>) {
    const { pluginID } = useNetworkContext()
    const { controlled } = value

    const globalAccount = useAccount(pluginID)
    const globalChainId = useChainId(pluginID)
    const globalProviderType = useProviderType(pluginID)

    const maskProvider = EVMWalletProviders[ProviderType.MaskWallet] as BaseEIP4337WalletProvider

    // The initial value of subscription.account could be empty string
    const maskAccount = usePersistSubscription('@@mask-account', maskProvider.subscription.account, (x) => !!x)
    const maskChainId = usePersistSubscription('@@mask-chain-id', maskProvider.subscription.chainId)

    const [_account, setAccount] = useState<string>()
    const [_chainId, setChainId] = useState<Web3Helper.ChainIdAll>()
    const [_providerType, setProviderType] = useState<Web3Helper.ProviderTypeAll>()

    const location = useLocation()
    const is_popup_wallet_page = Sniffings.is_popup_page && location.hash?.includes('/wallet')
    const account = controlled
        ? value.account
        : _account ?? value.account ?? (is_popup_wallet_page ? maskAccount : globalAccount)
    const chainId = controlled
        ? value.chainId
        : _chainId ?? value.chainId ?? (is_popup_wallet_page ? maskChainId : globalChainId)
    const providerType = controlled
        ? value.providerType
        : _providerType ?? value.providerType ?? (is_popup_wallet_page ? ProviderType.MaskWallet : globalProviderType)

    const context = useMemo(
        () => ({
            account,
            chainId,
            providerType,
            setAccount,
            setChainId,
            setProviderType,
        }),
        [account, chainId, providerType],
    )
    return <ChainContext.Provider value={context}>{children}</ChainContext.Provider>
})

/**
 * Provide a context that contains both network and chain context
 * @param props
 * @returns
 */
export function Web3ContextProvider({
    value,
    children,
}: ProviderProps<
    {
        pluginID: NetworkPluginID
    } & ChainContextGetter
>) {
    const { pluginID, ...rest } = value

    return compose(
        (children) => <NetworkContextProvider value={pluginID} children={children} />,
        (children) => <ChainContextProvider value={rest} children={children} />,
        <>{children}</>,
    )
}

/**
 * Provide the top most network context
 * @param props
 * @returns
 */
export function RevokeNetworkContextProvider({ children }: { children: ReactNode | undefined }) {
    const { pluginID } = useContext(ReadonlyNetworkContext)
    const value = useMemo(
        () => ({
            pluginID,
            setPluginID: () => {
                throw new Error('Set pluginID is not allowed.')
            },
        }),
        [pluginID],
    )
    return <NetworkContext.Provider value={value} children={children} />
}

/**
 * Provide the top most chain context
 * @param props
 * @returns
 */
export function RevokeChainContextProvider({ children }: { children: ReactNode | undefined }) {
    const account = useAccount()
    const chainId = useChainId()
    const providerType = useProviderType()
    const value = useMemo(
        () => ({
            account,
            chainId,
            providerType,
        }),
        [account, chainId, providerType],
    )
    return <ChainContext.Provider value={value} children={children} />
}

/**
 * The default Web3 context provider that uses the EVM plugin
 * @param props
 * @returns
 */
export function DefaultWeb3ContextProvider({
    value,
    children,
}: Partial<
    ProviderProps<
        Partial<
            {
                pluginID: NetworkPluginID
            } & ChainContextGetter
        >
    >
>) {
    const contextValue = useMemo(() => {
        return { pluginID: value?.pluginID ?? NetworkPluginID.PLUGIN_EVM, ...value }
    }, [JSON.stringify(value)])

    return <Web3ContextProvider value={contextValue}>{children}</Web3ContextProvider>
}

/**
 * The root Web3 context provider that uses the plugin ID from global settings
 * @param props
 * @returns
 */
export function RootWeb3ContextProvider({
    value,
    children,
}: Partial<
    ProviderProps<
        Partial<
            {
                pluginID: NetworkPluginID
            } & ChainContextGetter
        >
    >
>) {
    const pluginIDs = useValueRef(pluginIDsSettings)
    const contextValue = useMemo(() => {
        const site = getSiteType()
        return { pluginID: value?.pluginID ?? (site ? pluginIDs[site] : NetworkPluginID.PLUGIN_EVM) }
    }, [pluginIDs, JSON.stringify(value)])

    return (
        <ReadonlyNetworkContextProvider value={contextValue}>
            <Web3ContextProvider value={contextValue}>{children}</Web3ContextProvider>
        </ReadonlyNetworkContextProvider>
    )
}

export function useEnvironmentContext(overrides?: ReadonlyNetworkContext) {
    const context = useContext(ReadonlyNetworkContext)
    return {
        ...context,
        ...omitBy(overrides, isUndefined),
    }
}

export function useNetworkContext<T extends NetworkPluginID = NetworkPluginID>(overrides?: T) {
    const context = useContext(NetworkContext)
    return {
        ...context,
        pluginID: (overrides ?? context.pluginID) as T,
    }
}

export function useChainContext<T extends NetworkPluginID = NetworkPluginID>(overrides?: ChainContextGetter<T>) {
    const context = useContext(ChainContext)
    return {
        ...context,
        ...omitBy(overrides, isUndefined),
    } as Required<ChainContextGetter<T> & ChainContextSetter<T>>
}
