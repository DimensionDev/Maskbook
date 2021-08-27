declare namespace Mask {
    /**
     * @see https://eips.ethereum.org/EIPS/eip-1193
     *
     * @since SDK=0
     */
    // export const ethereum: Ethereum.Provider & Ethereum.ExperimentalMaskProvider

    export namespace Ethereum {
        /** Extra APIs that only can be used with Mask Network is defined here. */
        export interface ExperimentalMaskProvider {}
        export interface Provider {
            /**
             * The `request` method is intended as a transport- and protocol-agnostic wrapper function for Remote Procedure Calls (RPCs).
             */
            request(args: RequestArguments): Promise<unknown>
            /** @deprecated */
            sendAsync(request: Object, callback: Function): void
            /** @deprecated */
            send(...args: unknown[]): unknown
        }
        export interface RequestArguments {
            readonly method: string
            readonly params?: readonly unknown[] | object
        }

        export interface ProviderRpcError extends Error {
            code: number
            data?: unknown
        }
        export interface EventEmitter {
            on(eventName: 'message', listener: (message: ProviderMessage | EthSubscription) => void): this
            on(eventName: 'connect', listener: (message: ProviderConnectInfo) => void): this
            on(eventName: 'disconnect', listener: (error: ProviderRpcError) => void): this
            on(eventName: 'chainChanged', listener: (chainId: string) => void): this
            on(eventName: 'accountsChanged', listener: (accounts: string[]) => void): this
            /** @deprecated */
            on(eventName: 'close', listener: (...args: any[]) => void): this
            /** @deprecated */
            on(eventName: 'networkChanged', listener: (...args: any[]) => void): this
            /** @deprecated */
            on(eventName: 'notification', listener: (...args: any[]) => void): this
            on(eventName: string | symbol, listener: (...args: any[]) => void): this
            removeListener(eventName: string | symbol, listener: (...args: any[]) => void): this
        }
        export interface ProviderMessage {
            readonly type: string
            readonly data: unknown
        }
        export interface EthSubscription extends ProviderMessage {
            readonly type: 'eth_subscription'
            readonly data: {
                readonly subscription: string
                readonly result: unknown
            }
        }
        export interface ProviderConnectInfo {
            readonly chainId: string
        }
    }
}
