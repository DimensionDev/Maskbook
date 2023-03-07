declare module 'web3-core/types' {
    export interface TransactionReceipt {
        status: boolean
        transactionHash: string
        transactionIndex: number
        blockHash: string
        blockNumber: number
        from: string
        to: string
        contractAddress?: string
        cumulativeGasUsed: number
        gasUsed: number
        effectiveGasPrice: number
        logs: Log[]
        logsBloom: string
        events?: {
            [eventName: string]: EventLog | undefined
        }
    }

    export interface EventLog {
        event: string
        address: string
        returnValues: any
        logIndex: number
        transactionIndex: number
        transactionHash: string
        blockHash: string
        blockNumber: number
        raw?: { data: string; topics: any[] }
    }

    export interface Log {
        address: string
        data: string
        topics: string[]
        logIndex: number
        transactionIndex: number
        transactionHash: string
        blockHash: string
        blockNumber: number
    }

    export interface RequestArguments {
        method: string
        params?: any
        [key: string]: any
    }

    export interface Transaction {
        from?: string
        to?: string
        value?: string
        gas?: string
        gasPrice?: string
        maxPriorityFeePerGas?: string
        maxFeePerGas?: string
        data?: string
        nonce?: number
        chainId?: number

        // CELO
        feeCurrency?: string // address of the ERC20 contract to use to pay for gas and the gateway fee
        gatewayFeeRecipient?: string // coinbase address of the full serving the light client's transactions
        gatewayFee?: string // value paid to the gateway fee recipient, denominated in the fee currency
    }
}
