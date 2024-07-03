import type { Transaction as Web3Transaction } from 'web3-types'

export namespace ExplorerAPI {
    export type Transaction = Web3Transaction & {
        status: '0' | '1'
        confirmations: number
        blockHash: string
        blockNumber: number
        hash: string
        transactionIndex: number
    }

    export interface Options {
        offset?: number
    }
}
