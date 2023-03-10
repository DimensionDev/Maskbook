import type { Subscription } from 'use-subscription'
import type { Emitter } from '@servie/events'
import type { ECKeyIdentifier } from '@masknet/shared-base'
import type { Plugin } from '@masknet/plugin-infra/content-script'
import type { api } from '@dimensiondev/mask-wallet-core/proto'

export namespace WalletAPI {
    export interface Wallet {
        id: string
        /** User define wallet name. Default address.prefix(6) */
        name: string
        /** The address of wallet */
        address: string
        /** true: Mask Wallet, false: External Wallet */
        hasStoredKeyInfo: boolean
        /** true: Derivable Wallet. false: UnDerivable Wallet */
        hasDerivationPath: boolean
        /** yep: removable, nope: unremovable */
        configurable?: boolean
        /** the derivation path when wallet was created */
        derivationPath?: string
        /** the derivation path when wallet last was derived */
        latestDerivationPath?: string
        /** the internal presentation of mask wallet sdk */
        storedKeyInfo?: api.IStoredKeyInfo
        /** the Mask SDK stored key info */
        /** record created at */
        createdAt: Date
        /** record updated at */
        updatedAt: Date
        /** an abstract wallet has a owner */
        owner?: string
        /** an abstract wallet has been deployed */
        deployed?: boolean
        /** persona identifier */
        identifier?: string
    }

    export interface Account<ChainId> {
        account: string
        chainId: ChainId
    }

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
        setup(context: Plugin.SNSAdaptor.SNSAdaptorContext): Promise<void>
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
        /** Update a bunch of wallets. */
        updateWallets(wallets: Wallet[]): Promise<void>
        /** Remove a bunch of wallets. */
        removeWallets(wallets: Wallet[]): Promise<void>
        /** Switch to the designate account. */
        switchAccount(account?: string): Promise<void>
        /** Switch to the designate chain. */
        switchChain(chainId?: ChainId): Promise<void>
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
