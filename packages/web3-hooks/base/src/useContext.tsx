import { createContext, useContext, useState, useMemo, memo, type PropsWithChildren } from 'react'
import { isUndefined, omitBy } from 'lodash-es'
import { usePersistSubscription, useValueRef } from '@masknet/shared-base-ui'
import { Sniffings, NetworkPluginID, getSiteType, pluginIDsSettings, PopupRoutes } from '@masknet/shared-base'
import { MaskWalletProvider } from '@masknet/web3-providers'
import { ProviderType } from '@masknet/web3-shared-evm'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useAccount } from './useAccount.js'
import { useChainId } from './useChainId.js'
import { useProviderType } from './useProviderType.js'
import { useLocation } from 'react-use'

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

const ReadonlyNetworkContext = createContext<NetworkPluginID>(null!)
ReadonlyNetworkContext.displayName = 'ReadonlyNetworkContext'

const NetworkContext = createContext<NetworkContext>(null!)
NetworkContext.displayName = 'NetworkContext'

const ChainContext = createContext<ChainContextGetter & ChainContextSetter>(null!)
ChainContext.displayName = 'ChainContext'

/**
 * Provide the current selected network plugin ID
 * @param props
 * @returns
 */
export function NetworkContextProvider({
    initialNetwork,
    children,
}: PropsWithChildren<{ initialNetwork: NetworkPluginID }>) {
    const [pluginID, setPluginID] = useState<NetworkPluginID>()
    const networkPluginID = pluginID || initialNetwork
    const context = useMemo(() => ({ pluginID: networkPluginID, setPluginID }), [networkPluginID])
    return <NetworkContext value={context}>{children}</NetworkContext>
}

/**
 * Provide the current chain context
 * @param props
 * @returns
 */
export const ChainContextProvider = memo(function ChainContextProvider(props: PropsWithChildren<ChainContextGetter>) {
    const { pluginID } = useNetworkContext()
    const { controlled } = props

    const globalAccount = useAccount(pluginID)
    const globalChainId = useChainId(pluginID)
    const globalProviderType = useProviderType(pluginID)
    const [networkType, setNetworkType] = useState<Web3Helper.NetworkTypeAll>()

    // The initial value of subscription.account could be empty string
    const maskAccount = usePersistSubscription('@@mask-account', MaskWalletProvider.subscription.account, (x) => !!x)
    const maskChainId = usePersistSubscription('@@mask-chain-id', MaskWalletProvider.subscription.chainId)

    const [_account, setAccount] = useState<string>()
    const [_chainId, setChainId] = useState<Web3Helper.ChainIdAll>()
    const [_providerType, setProviderType] = useState<Web3Helper.ProviderTypeAll>()

    const location = useLocation()
    const is_popup_wallet_page = Sniffings.is_popup_page && location.hash?.includes(PopupRoutes.Wallet)
    const account =
        controlled ? props.account : (_account ?? props.account ?? (is_popup_wallet_page ? maskAccount : globalAccount))
    const chainId =
        controlled ? props.chainId : (_chainId ?? props.chainId ?? (is_popup_wallet_page ? maskChainId : globalChainId))
    const providerType =
        controlled ?
            props.providerType
        :   (_providerType ??
            props.providerType ??
            (is_popup_wallet_page ? ProviderType.MaskWallet : globalProviderType))

    const context = useMemo(
        () => ({
            account,
            chainId,
            networkType,
            providerType,
            setAccount,
            setChainId,
            setProviderType,
            setNetworkType,
        }),
        [account, chainId, providerType, networkType],
    )

    return <ChainContext value={context}>{props.children}</ChainContext>
})

/**
 * Provide a context that contains both network and chain context
 * @param props
 * @returns
 */
export function Web3ContextProvider<T extends NetworkPluginID = NetworkPluginID>({
    network,
    children,
    ...rest
}: PropsWithChildren<{ network: T } & ChainContextGetter<T>>) {
    return (
        <NetworkContextProvider initialNetwork={network}>
            <ChainContextProvider {...rest}>{children}</ChainContextProvider>
        </NetworkContextProvider>
    )
}

/**
 * Provide the top most chain context
 * @param props
 * @returns
 */
export function RevokeChainContextProvider({ children }: PropsWithChildren) {
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
export function EVMWeb3ContextProvider(props: PropsWithChildren & ChainContextGetter<NetworkPluginID.PLUGIN_EVM>) {
    return <Web3ContextProvider network={NetworkPluginID.PLUGIN_EVM} {...props} />
}

export function SOLWeb3ContextProvider(props: PropsWithChildren & ChainContextGetter<NetworkPluginID.PLUGIN_SOLANA>) {
    return <Web3ContextProvider network={NetworkPluginID.PLUGIN_SOLANA} {...props} />
}

/**
 * The root Web3 context provider that uses the plugin ID from global settings
 * @param props
 * @returns
 */
export function RootWeb3ContextProvider({ enforceEVM, children }: PropsWithChildren<{ enforceEVM?: boolean }>) {
    const pluginIDs = useValueRef(pluginIDsSettings)
    const contextValue = useMemo(() => {
        const site = getSiteType()
        return (
            enforceEVM ? NetworkPluginID.PLUGIN_EVM
            : site ? pluginIDs[site]
            : NetworkPluginID.PLUGIN_EVM
        )
    }, [pluginIDs, enforceEVM])

    return (
        <ReadonlyNetworkContext value={contextValue}>
            <Web3ContextProvider network={contextValue}>{children}</Web3ContextProvider>
        </ReadonlyNetworkContext>
    )
}

export function useEnvironmentContext(overrides?: NetworkPluginID) {
    const context = useContext(ReadonlyNetworkContext)
    return {
        pluginID: context,
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
