import type { Subscription } from 'use-subscription'
import type { Emitter } from '@servie/events'
import type { ECKeyIdentifier, Account, Wallet } from '@masknet/shared-base'
import type { Plugin } from '@masknet/plugin-infra/content-script'

export namespace WalletAPI {
    export interface ProviderEvents<ChainId, ProviderType> {
        /** Emit when the chain id changed. */
        chainId: [string]
        /** Emit when the accounts changed. */
        accounts: [string[]]
        /** Emit when the site connects with a provider. */
        connect: [Account<ChainId>]
        /** Emit when the site disconnect with a provider. */
        disconnect: [ProviderType]
    }

    export interface ProviderOptions<ChainId> {
        chainId: ChainId
        account?: string
    }

    export interface Provider<ChainId, ProviderType, Web3Provider, Web3> {
        readonly emitter: Emitter<ProviderEvents<ChainId, ProviderType>>

        readonly subscription: {
            account: Subscription<string>
            chainId: Subscription<ChainId>
            wallets: Subscription<Wallet[]>
        }

        /** Get to know whether the provider is ready. */
        readonly ready: boolean
        /** Keep waiting until the provider is ready. */
        readonly readyPromise: Promise<void>
        /** connection status */
        readonly connected: boolean
        /** async setup tasks */
        setup(context?: Plugin.Shared.SharedUIContext): Promise<void>
        /** Add a new wallet. */
        addWallet(wallet: Wallet): Promise<void>
        /** Update a wallet. */
        updateWallet(address: string, wallet: Wallet): Promise<void>
        /** Add or update a new wallet on demand. */
        updateOrAddWallet(wallet: Wallet): Promise<void>
        /** Rename a wallet */
        renameWallet(address: string, name: string): Promise<void>
        /** Remove a wallet */
        removeWallet(address: string, password?: string | undefined): Promise<void>
        /** Reset all wallets */
        resetAllWallets(): Promise<void>
        /** Update a bunch of wallets. */
        updateWallets(wallets: Wallet[]): Promise<void>
        /** Remove a bunch of wallets. */
        removeWallets(wallets: Wallet[]): Promise<void>
        /** Switch to the designate account. */
        switchAccount(account?: string): Promise<void>
        /** Switch to the designate chain. */
        switchChain(chainId: ChainId): Promise<void>
        /** Create an instance from the network SDK. */
        createWeb3(options?: ProviderOptions<ChainId>): Web3
        /** Create an instance that implement the wallet protocol. */
        createWeb3Provider(options?: ProviderOptions<ChainId>): Web3Provider
        /** Create the connection. */
        connect(
            chainId?: ChainId,
            address?: string,
            owner?: {
                account: string
                identifier?: ECKeyIdentifier
            },
            silent?: boolean,
        ): Promise<Account<ChainId>>
        /** Dismiss the connection. */
        disconnect(): Promise<void>
    }
}
