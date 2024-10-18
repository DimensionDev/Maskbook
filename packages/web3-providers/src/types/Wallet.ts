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

    export interface WalletConnectIOContext {
        /** Open walletconnect dialog */
        openWalletConnectDialog(uri: string): Promise<void>
        /** Close walletconnect dialog */
        closeWalletConnectDialog(): void
    }
    export interface MaskWalletIOContext {
        /** Get all wallets */
        wallets: Subscription<Wallet[]>
        allPersonas: Subscription<readonly PersonaInformation[]>
        resetAllWallets(): Promise<void>
        /** Remove a old wallet */
        removeWallet(id: string, password?: string): Promise<void>
        renameWallet(address: string, name: string): Promise<void>
        /** Add a new wallet */
        addWallet(
            source: ImportSource,
            id: string,
            updates?: {
                name?: string
                derivationPath?: string
                storedKeyInfo?: never
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
    export type SignWithPersona = (
        type: SignType,
        message: unknown,
        identifier?: ECKeyIdentifier,
        silent?: boolean,
    ) => Promise<string>
    export interface MessageIOContext {
        /** Send request to native API, for a risky request will be added into the waiting queue. */
        send(payload: JsonRpcPayload, options: TransactionOptions): Promise<JsonRpcResponse>
        /** Open popup window */
        openPopupWindow<T extends PopupRoutes>(
            route: T,
            params: T extends keyof PopupRoutesParamsMap ? PopupRoutesParamsMap[T] : undefined,
        ): Promise<void>
        hasPaymentPassword(): Promise<boolean>
    }
    export interface IOContext {
        MaskWalletContext: MaskWalletIOContext
        MessageContext: MessageIOContext
        WalletConnectContext: WalletConnectIOContext
        /** Sign a message with persona (w or w/o popups) */
        signWithPersona: SignWithPersona
    }
    export interface Provider<ChainId, ProviderType> {
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
        /** Post-constructor code */
        setup?(): void
        /** Switch to the designate chain. */
        switchChain(chainId: ChainId): Promise<void>
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
