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
        request<key extends keyof RPC.ImplementedMethods>(args: {
            readonly method: key
            readonly params: Readonly<Parameters<RPC.ImplementedMethods[key]>>
        }): Promise<ReturnType<RPC.ImplementedMethods[key]>>
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

// Implemented RPCs
// https://github.com/typescript-eslint/typescript-eslint/issues/7192
// eslint-disable-next-line @typescript-eslint/no-unnecessary-qualifier
declare namespace Mask.Ethereum.RPC {
    export interface Block {
        hash: string
        parentHash: string
        sha3Uncles: string
        miner: string
        stateRoot: string
        transactionsRoot: string
        receiptsRoot: string
        logsBloom: string
        difficulty?: string
        number: string
        gasLimit: string
        gasUsed: string
        timestamp: string
        extraData: string
        mixHash: string
        nonce: string
        totalDifficulty?: string
        baseFeePerGas?: string
        withdrawalsRoot?: string
        size: string
        transactions: string[] | Transaction[]
        withdrawals: Array<{ index: string; validatorIndex: string; address: string; amount: string }>
        uncles: string[]
    }
    export interface Signed1559Transaction {
        blockHash: string
        blockNumber: string
        from: string
        hash: string
        transactionIndex: string
        type: string
        nonce: string
        to?: string | null
        gas: string
        value: string
        input: string
        maxPriorityFeePerGas: string
        maxFeePerGas: string
        gasPrice: string
        accessList: EIP2930AccessListEntry[]
        chainId: string
        yParity: string
        v?: string
        r: string
        s: string
    }
    export interface EIP2930AccessListEntry {
        address: string
        storageKeys: string[]
    }
    export interface Signed2930Transaction {
        blockHash: string
        blockNumber: string
        from: string
        hash: string
        transactionIndex: string
        type: string
        nonce: string
        to?: string | null
        gas: string
        value: string
        input: string
        gasPrice: string
        accessList: EIP2930AccessListEntry[]
        chainId: string
        yParity: string
        v?: string
        r: string
        s: string
    }
    export interface SignedLegacyTransaction {
        blockHash: string
        blockNumber: string
        from: string
        hash: string
        transactionIndex: string
        type: string
        nonce: string
        to?: string | null
        gas: string
        value: string
        input: string
        gasPrice: string
        chainId?: string
        v: string
        r: string
        s: string
    }
    export type Transaction = Signed1559Transaction | Signed2930Transaction | SignedLegacyTransaction
    export interface Receipt {
        type?: string
        transactionHash: string
        transactionIndex: string
        blockHash: string
        blockNumber: string
        from: string
        to?: unknown
        cumulativeGasUsed: string
        gasUsed: string
        contractAddress?: unknown
        logs: Log[]
        logsBloom: string
        root?: string
        status?: string
        effectiveGasPrice: string
    }
    export interface Log {
        removed?: boolean
        logIndex?: string
        transactionIndex?: string
        transactionHash: string
        blockHash?: string
        blockNumber?: string
        address?: string
        data?: string
        topics?: string[]
    }
    export interface Filter {
        fromBlock?: string
        toBlock?: string
        address?: string | string[]
        topics?: string[]
        blockhash?: string
    }
    export interface EIP2255Caveat {
        type: string
        value: unknown
    }
    export interface EIP2255Permission {
        invoker: string
        parentCapability: string
        caveats: EIP2255Caveat[]
    }
    export interface EIP2255RequestedPermission {
        parentCapability: string
        date?: number
    }
    export interface EIP2255PermissionRequest {
        [methodName: string]: {
            [caveatName: string]: any
        }
    }
    interface ImplementedMethods {
        // Readonly methods
        eth_getCode(address: string, block?: string): string
        eth_gasPrice(): string
        eth_blockNumber(): string
        eth_getBalance(address: string, block?: string): string
        eth_getBlockByNumber(block: string, hydrated_transactions: boolean): Block | null
        eth_getBlockByHash(hash: string, hydrated_transactions: boolean): Block | null
        eth_getTransactionByHash(hash: string): Transaction | null
        eth_getTransactionReceipt(transaction_hash: string): Receipt | null
        eth_getTransactionCount(address: string, block?: string): string
        eth_getFilterChanges(id: string): string[] | Log[]
        eth_newPendingTransactionFilter(): string
        eth_estimateGas(transaction: Transaction, block?: string): string
        eth_call(transaction: Transaction, block?: string): string
        eth_getLogs(filter: Filter): string[] | Log[]

        // https://eips.ethereum.org/EIPS/eip-2255
        wallet_getPermissions(): EIP2255Permission[]
        wallet_requestPermissions(request: EIP2255PermissionRequest): EIP2255RequestedPermission[]
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
