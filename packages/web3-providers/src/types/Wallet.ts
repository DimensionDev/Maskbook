import type { Subscription } from 'use-subscription'
import type { Emitter } from '@servie/events'
import type {
    ECKeyIdentifier,
    Account,
    Wallet,
    PopupRoutes,
    PopupRoutesParamsMap,
    SignMessage,
} from '@masknet/shared-base'
import type { JsonRpcRequest, JsonRpcResponse } from '@masknet/web3-shared-base'
import type { TransactionOptions } from '@masknet/web3-shared-evm'

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
    export type SignWithPersona = (
        message: SignMessage,
        identifier?: ECKeyIdentifier,
        silent?: boolean,
    ) => Promise<string>
    export interface MessageIOContext {
        /** Send request to native API, for a risky request will be added into the waiting queue. */
        send(payload: JsonRpcRequest, options: TransactionOptions): Promise<JsonRpcResponse>
        /** Open popup window */
        openPopupWindow<T extends PopupRoutes>(
            route: T,
            params: T extends keyof PopupRoutesParamsMap ? PopupRoutesParamsMap[T] : undefined,
        ): Promise<void>
    }
    export interface IOContext {
        MessageContext: MessageIOContext
        WalletConnectContext: WalletConnectIOContext
    }
    export interface Provider<ChainId, ProviderType> {
        readonly ready: boolean
        readonly readyPromise?: Promise<void> | undefined
        readonly emitter: Emitter<ProviderEvents<ChainId, ProviderType>>

        readonly subscription?: {
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
        connect(chainId?: ChainId, address?: string, silent?: boolean): Promise<Account<ChainId>>
        /** Dismiss the connection. */
        disconnect(): Promise<void>
    }
}
