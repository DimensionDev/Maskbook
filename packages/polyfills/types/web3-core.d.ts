declare module 'web3-core' {
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
}
