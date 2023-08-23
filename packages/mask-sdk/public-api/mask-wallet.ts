declare namespace Mask {
    /**
     * @see https://eips.ethereum.org/EIPS/eip-1193
     * A EIP-1193 compatible Ethereum provider.
     * @public
     * @remarks Since API=0
     */
    export const ethereum: undefined | Ethereum.ProviderObject
}
// Defined in EIP-1193
// https://github.com/typescript-eslint/typescript-eslint/issues/7192
// eslint-disable-next-line @typescript-eslint/no-unnecessary-qualifier
declare namespace Mask.Ethereum {
    export interface ProviderObject extends Ethereum.Provider, Ethereum.EthereumEventEmitter {}
    export interface Provider {
        /**
         * The `request` method is intended as a transport- and protocol-agnostic wrapper function for Remote Procedure Calls (RPCs).
         */
        request(args: RequestArguments): Promise<unknown>
    }
    export interface RequestArguments {
        readonly method: string
        readonly params?: readonly unknown[] | object
    }
    export interface ProviderRpcError extends Error {
        code: number
        data?: unknown
    }
    /**
     * @see https://nodejs.org/api/events.html
     */
    export interface EventEmitter {
        on(eventName: string | symbol, listener: (...args: any[]) => void): this
        removeListener(eventName: string | symbol, listener: (...args: any[]) => void): this
    }
    export interface EthereumEventEmitter extends EventEmitter {
        on(eventName: 'message', listener: (message: ProviderMessage | EthSubscription) => void): this
        on(eventName: 'connect', listener: (message: ProviderConnectInfo) => void): this
        on(eventName: 'disconnect', listener: (error: ProviderRpcError) => void): this
        on(eventName: 'chainChanged', listener: (chainId: string) => void): this
        on(eventName: 'accountsChanged', listener: (accounts: string[]) => void): this
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

// Mask specific part
// https://github.com/typescript-eslint/typescript-eslint/issues/7192
// eslint-disable-next-line @typescript-eslint/no-unnecessary-qualifier
declare namespace Mask.Ethereum {
    export interface ProviderObject
        extends Ethereum.Provider,
            Ethereum.ExperimentalProvider,
            Ethereum.EthereumEventEmitter {}

    /** Extra APIs that only can be used with Mask Network is defined here. */
    export interface ExperimentalProvider {}
    export interface EthereumEventEmitter extends EventEmitter {
        on(eventName: 'message', listener: (message: ProviderMessage | EthSubscription) => void): this
        on(eventName: 'connect', listener: (message: ProviderConnectInfo) => void): this
        on(eventName: 'disconnect', listener: (error: ProviderRpcError) => void): this
        on(eventName: 'chainChanged', listener: (chainId: string) => void): this
        on(eventName: 'accountsChanged', listener: (accounts: string[]) => void): this
    }
    export interface EthereumEventMap {
        message: CustomEvent<ProviderMessage | EthSubscription>
        connect: CustomEvent<ProviderConnectInfo>
        disconnect: CustomEvent<ProviderRpcError>
        chainChanged: CustomEvent<string>
        accountsChanged: CustomEvent<string[]>
    }
    export interface MaskEthereumEventEmitter extends EthereumEventEmitter, EventTarget {
        addEventListener<K extends keyof EthereumEventMap>(
            type: K,
            callback: EventListenerOrEventListenerObject | null | ((ev: EthereumEventMap[K]) => any),
            options?: boolean | AddEventListenerOptions,
        ): void
        removeEventListener<K extends keyof EthereumEventMap>(
            type: K,
            listener: EventListenerOrEventListenerObject | null | ((ev: EthereumEventMap[K]) => any),
            options?: boolean | EventListenerOptions,
        ): void
    }
}
