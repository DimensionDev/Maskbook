// Defined in EIP-1193
export declare namespace Ethereum {
    export interface ProviderObject extends EIP1193Provider, EthereumEventEmitter {}
    export interface EIP1193Provider {
        /**
         * The `request` method is intended as a transport- and protocol-agnostic wrapper function for Remote Procedure Calls (RPCs).
         * @remarks Since API=0
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
        /**
         * @remarks Since API=0
         */
        on(eventName: string | symbol, listener: (...args: any[]) => void): this
        /**
         * @remarks Since API=0
         */
        removeListener(eventName: string | symbol, listener: (...args: any[]) => void): this
    }
    export interface EthereumEventEmitter extends EventEmitter {
        on(eventName: 'message', listener: (message: ProviderMessage | EthSubscription) => void): this
        // on(eventName: 'connect', listener: (message: ProviderConnectInfo) => void): this
        // on(eventName: 'disconnect', listener: (error: ProviderRpcError) => void): this
        // on(eventName: 'chainChanged', listener: (chainId: string) => void): this
        // on(eventName: 'accountsChanged', listener: (accounts: string[]) => void): this
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

// Defined in EIP-6963
export declare namespace Ethereum {
    export interface EIP6963ProviderInfo {
        uuid: string
        name: string
        icon: string
        rdns: string
    }
    export interface EIP6963ProviderDetail {
        info: EIP6963ProviderInfo
        provider: EIP1193Provider
    }
}

// Implemented RPCs

export declare namespace Ethereum.RPC {
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
        net_version: () => string
        eth_accounts: () => string[]
        eth_blockNumber: () => string
        eth_call: (transaction: Transaction, block?: string) => string
        eth_chainId: () => string
        eth_estimateGas: (transaction: Transaction, block?: string) => string
        eth_feeHistory: (args_0: string | number, args_1: string, args_2: number[]) => any
        eth_gasPrice: () => string
        eth_getBalance: (address: string, block?: string | null | undefined) => string
        eth_getBlockByHash: (hash: string, hydrated_transactions?: boolean | null | undefined) => Block | null
        eth_getBlockByNumber: (block: string, hydrated_transactions?: boolean | null | undefined) => Block | null
        eth_getBlockReceipts: (args_0: string) => any
        eth_getBlockTransactionCountByHash: (args_0: string) => string | null | undefined
        eth_getBlockTransactionCountByNumber: (args_0: string) => string | null | undefined
        eth_getCode: (address: string, block?: string | null | undefined) => string
        eth_getLogs: (filter: Filter) => string[] | Log[]
        eth_getProof: (args_0: string, args_1: string[], args_2: string) => any
        eth_getStorageAt: (args_0: string, args_1: string, args_2: string | null | undefined) => string
        eth_getTransactionByBlockHashAndIndex: (args_0: string, args_1: string) => any
        eth_getTransactionByBlockNumberAndIndex: (args_0: string, args_1: string) => any
        eth_getTransactionByHash: (hash: string) => Transaction | null
        eth_getTransactionCount: (address: string, block?: string | null | undefined) => string
        eth_getTransactionReceipt: (transaction_hash: string) => Receipt | null
        eth_getUncleCountByBlockHash: (args_0: string) => string | null | undefined
        eth_getUncleCountByBlockNumber: (args_0: string) => string | null | undefined
        eth_syncing: () => any

        personal_sign: (args_0: string, args_1: string) => string
        eth_sendTransaction: (transaction: any) => any
        eth_sendRawTransaction: (args_0: string) => string
        eth_subscribe: (
            args_0: 'newHeads' | 'logs' | 'newPendingTransactions' | 'syncing',
            args_1:
                | {
                      topics: string[]
                      address?: string | string[] | null | undefined
                  }
                | null
                | undefined,
        ) => string
        eth_unsubscribe: (args_0: string) => boolean

        eth_getFilterChanges: (id: string) => string[] | Log[]
        eth_getFilterLogs: (args_0: string) => any
        eth_newBlockFilter: () => string
        eth_newFilter: (args_0: any) => string
        eth_uninstallFilter: (args_0: string) => boolean

        eth_requestAccounts: () => string[]

        wallet_getPermissions: () => EIP2255Permission[]
        wallet_requestPermissions(request: EIP2255PermissionRequest): EIP2255RequestedPermission[]
    }
}

// Mask specific part
export declare namespace Ethereum {
    export interface ProviderObject extends EIP1193Provider, ExperimentalProvider, EthereumEventEmitter {}

    /** Extra APIs that only can be used with Mask Network is defined here. */
    export type ExperimentalProvider = Record<never, never>
    export interface EthereumEventMap {
        message: CustomEvent<ProviderMessage | EthSubscription>
        // connect: CustomEvent<ProviderConnectInfo>
        // disconnect: CustomEvent<ProviderRpcError>
        // chainChanged: CustomEvent<string>
        // accountsChanged: CustomEvent<string[]>
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
