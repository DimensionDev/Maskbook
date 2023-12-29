import type { Subscription } from 'use-subscription'
import type { Emitter } from '@servie/events'
import type {
    ECKeyIdentifier,
    Account,
    Wallet,
    SignType,
    PopupRoutes,
    PopupRoutesParamsMap,
    PersonaInformation,
    ImportSource,
} from '@masknet/shared-base'
import type { JsonRpcPayload, JsonRpcResponse } from 'web3-core-helpers'
import type { ChainId, TransactionOptions } from '@masknet/web3-shared-evm'
import type { api } from '@dimensiondev/mask-wallet-core/proto'

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

    export interface MaskWalletIOContext {
        allPersonas: Subscription<readonly PersonaInformation[]>
        resetAllWallets(): Promise<void>
        /** Remove a old wallet */
        removeWallet(id: string, password?: string): Promise<void>
        renameWallet(address: string, name: string): Promise<void>
    }
    export interface IOContext {
        MaskWalletContext?: MaskWalletIOContext
        /** Send request to native API, for a risky request will be added into the waiting queue. */
        send(payload: JsonRpcPayload, options?: TransactionOptions): Promise<JsonRpcResponse>
        hasPaymentPassword(): Promise<boolean>
        /** Sign a message with persona (w or w/o popups) */
        signWithPersona(
            type: SignType,
            message: unknown,
            identifier?: ECKeyIdentifier,
            silent?: boolean,
        ): Promise<string>
        /** Open popup window */
        openPopupWindow<T extends PopupRoutes>(
            route: T,
            params: T extends keyof PopupRoutesParamsMap ? PopupRoutesParamsMap[T] : undefined,
        ): Promise<void>
        /** Open walletconnect dialog */
        openWalletConnectDialog(uri: string): Promise<void>
        /** Close walletconnect dialog */
        closeWalletConnectDialog(): void
        /** Get all wallets */
        wallets: Subscription<Wallet[]>
        /** Add a new wallet */
        addWallet(
            source: ImportSource,
            id: string,
            updates?: {
                name?: string
                derivationPath?: string
                storedKeyInfo?: api.IStoredKeyInfo
            },
        ): Promise<string>
        /** Connect origin to Mask wallet  */
        sdk_grantEIP2255Permission(id: string, grantedWalletAddress: Set<string> | string[]): Promise<void>

        /** Select a Mask Wallet account */
        selectMaskWalletAccount(
            chainId: ChainId,
            defaultAccount?: string,
            source?: string,
        ): Promise<Array<{ address: string; owner?: string; identifier?: ECKeyIdentifier }>>

        /** Disconnect origin from Mask wallet  */
        disconnectAllWalletsFromOrigin(origin: string, type: 'any' | 'sdk' | 'internal'): Promise<void>
    }
    export interface Provider<ChainId, ProviderType, Web3Provider, Web3> {
        readonly ready: boolean
        readonly readyPromise?: Promise<void> | undefined
        readonly emitter: Emitter<ProviderEvents<ChainId, ProviderType>>

        readonly subscription: {
            account: Subscription<string>
            chainId: Subscription<ChainId>
            wallets: Subscription<Wallet[]>
        }

        /** connection status */
        readonly connected: boolean
        /** async setup tasks */
        setup(context: IOContext): Promise<void>
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
    export interface HostedProvider {
        /** Add a new wallet. */
        addWallet(wallet: Wallet): Promise<void>
        /** Update a wallet. */
        updateWallet(address: string, wallet: Wallet): Promise<void>
        /** Rename a wallet */
        renameWallet(address: string, name: string): Promise<void>
        /** Remove a wallet */
        removeWallet(address: string, password?: string | undefined): Promise<void>
        /** Reset all wallets */
        resetAllWallets(): Promise<void>
        /** Update a bunch of wallets. */
        updateWallets(wallets: readonly Wallet[]): Promise<void>
        /** Remove a bunch of wallets. */
        removeWallets(wallets: readonly Wallet[]): Promise<void>
        /** Switch to the designate account. */
        switchAccount(account?: string): Promise<void>
    }
}
